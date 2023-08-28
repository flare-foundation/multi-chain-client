import BN from "bn.js";
import { Payment, Transaction, TransactionMetadata } from "xrpl";
import { IssuedCurrencyAmount, Memo } from "xrpl/dist/npm/models/common";
import { isCreatedNode, isDeletedNode, isModifiedNode } from "xrpl/dist/npm/models/transactions/metadata";
import { TransactionSuccessStatus } from "../../types/genericMccTypes";
import { IXrpGetTransactionRes, XrpTransactionStatusPrefixes, XrpTransactionStatusTec, XrpTransactionTypeUnion } from "../../types/xrpTypes";
import { XRP_MDU, XRP_NATIVE_TOKEN_NAME, XRP_UTD } from "../../utils/constants";
import { ZERO_BYTES_32, bytesAsHexToString, isValidBytes32Hex, prefix0x, standardAddressHash, toBN } from "../../utils/utils";
import {
    AddressAmount,
    BalanceDecreasingProps,
    BalanceDecreasingSummaryResponse,
    BalanceDecreasingSummaryStatus,
    PaymentSummaryProps,
    PaymentSummaryResponse,
    PaymentSummaryStatus,
    TransactionBase,
    TransactionGetterFunction,
} from "../TransactionBase";

// @Managed()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class XrpTransaction extends TransactionBase<XrpTransaction> {
    protected get data(): IXrpGetTransactionRes {
        return this.privateData as IXrpGetTransactionRes;
    }

    public get txid(): string {
        return this.hash;
    }

    public get stdTxid(): string {
        return this.txid;
    }

    public get hash(): string {
        return this.data.result.hash;
    }

    public get reference(): string[] {
        if (this.data.result.Memos) {
            return this.data.result.Memos.map((memoObj: Memo) => {
                return memoObj.Memo.MemoData || "";
            });
        }
        return [];
    }

    public get stdPaymentReference(): string {
        const paymentReference = this.reference.length === 1 ? prefix0x(this.reference[0]) : "";
        if (isValidBytes32Hex(paymentReference)) {
            return paymentReference;
        } else {
            const alternative = bytesAsHexToString(paymentReference);
            if (isValidBytes32Hex(alternative)) {
                return alternative;
            }
            return ZERO_BYTES_32;
        }
    }

    public get unixTimestamp(): number {
        return (
            XRP_UTD +
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.data.result.date
        );
    }

    public get sourceAddresses(): string[] {
        const sourceAddresses: string[] = [];
        for (const addAmm of this.spentAmounts) {
            if (addAmm.address) {
                sourceAddresses.push(addAmm.address);
            }
        }
        return sourceAddresses;
    }

    public get assetSourceAddresses(): (string | undefined)[] {
        throw new Error("Method not implemented.");
    }

    public get receivingAddresses(): string[] {
        const receivingAddresses: string[] = [];
        for (const addAmm of this.receivedAmounts) {
            if (addAmm.address) {
                receivingAddresses.push(addAmm.address);
            }
        }
        return receivingAddresses;
    }

    public get assetReceivingAddresses(): (string | undefined)[] {
        throw new Error("Method not implemented.");
    }

    public get fee(): BN {
        /* istanbul ignore if */
        if (!this.data.result.Fee) {
            return toBN(0);
        }
        return toBN(this.data.result.Fee);
    }

    public get feeSignerTotalAmount(): AddressAmount {
        const spentAmounts = this.spentAmounts;
        // Check if signer is already in source amounts
        const feeSigner = this.data.result.Account;
        for (const spentAmount of spentAmounts) {
            if (spentAmount.address === feeSigner) {
                return spentAmount;
            }
        }
        // Check if singer got positive amount
        const receivedAmounts = this.receivedAmounts;
        for (const receivedAmount of receivedAmounts) {
            if (receivedAmount.address === feeSigner) {
                const { amount, ...rest } = receivedAmount;
                return {
                    amount: amount.neg(),
                    ...rest,
                };
            }
        }
        // You cash a check for exactly fee amount
        return {
            amount: toBN(0),
            address: feeSigner,
        };
    }

    public get spentAmounts(): AddressAmount[] {
        if (typeof this.data.result.meta === "string" || !this.data.result.meta) {
            throw new Error("Transaction meta is not available thus spent amounts cannot be calculated");
        }
        const spendAmounts: AddressAmount[] = [];
        for (const node of this.data.result.meta.AffectedNodes) {
            if (isModifiedNode(node)) {
                if (
                    node.ModifiedNode.LedgerEntryType === "AccountRoot" &&
                    node.ModifiedNode.FinalFields &&
                    node.ModifiedNode.PreviousFields &&
                    node.ModifiedNode.FinalFields.Account &&
                    node.ModifiedNode.FinalFields.Balance &&
                    node.ModifiedNode.PreviousFields.Balance
                ) {
                    // TODO: this is due to xrpl.js lib mistakes
                    const diff = toBN(node.ModifiedNode.FinalFields.Balance as string).sub(toBN(node.ModifiedNode.PreviousFields.Balance as string));
                    if (diff.lt(toBN(0))) {
                        spendAmounts.push({
                            address: node.ModifiedNode.FinalFields.Account as string,
                            amount: diff.neg(),
                        });
                    }
                }
            }
            if (isCreatedNode(node)) {
                // TODO: check if true
                // Created node can't affect spend amounts
            }
            if (isDeletedNode(node)) {
                if (node.DeletedNode.LedgerEntryType === "AccountRoot" && "PreviousFields" in node.DeletedNode) {
                    if (node.DeletedNode.FinalFields && node.DeletedNode.FinalFields.Account) {
                        if (node.DeletedNode.FinalFields.Balance) {
                            // TODO: this is due to xrpl.js lib mistakes
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            const diff = toBN(node.DeletedNode.FinalFields.Balance as string).sub(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                toBN(((node.DeletedNode as any).PreviousFields as any).Balance as string)
                            );
                            if (diff.lt(toBN(0))) {
                                spendAmounts.push({
                                    address: node.DeletedNode.FinalFields.Account as string,
                                    amount: diff.neg(),
                                });
                            }
                        } else {
                            // TODO: this is due to xrpl.js lib mistakes
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
                            const diff = toBN(((node.DeletedNode as any).PreviousFields as any).Balance as string);
                            if (diff.gt(toBN(0))) {
                                spendAmounts.push({
                                    address: node.DeletedNode.FinalFields.Account as string,
                                    amount: diff,
                                });
                            }
                        }
                    }
                }
            }
        }
        // // Check if signer is already in source amounts
        // const feeSigner = this.data.result.Account;
        // for (const spendAmount of spendAmounts) {
        //    if (spendAmount.address === feeSigner) {
        //       return spendAmounts;
        //    }
        // }
        // // Check if singer got positive amount
        // const receivedAmounts = this.receivedAmounts;
        // for (const receivedAmount of receivedAmounts) {
        //    if (receivedAmount.address === feeSigner) {
        //       const { amount, ...rest } = receivedAmount;
        //       spendAmounts.push({
        //          amount: amount.neg(),
        //          ...rest,
        //       });
        //       return spendAmounts;
        //    }
        // }
        // // You cash a check for exactly fee amount
        // spendAmounts.push({
        //    amount: toBN(0),
        //    address: feeSigner,
        // });
        return spendAmounts;
    }

    public get intendedSpentAmounts(): AddressAmount[] {
        if (this.successStatus === TransactionSuccessStatus.SUCCESS) {
            return this.spentAmounts;
        }
        switch (this.type) {
            case "Payment": {
                const payment = this.data.result as Payment;
                if (this.isNativePayment) {
                    if (typeof payment.Amount === "string") {
                        return [
                            {
                                address: payment.Account,
                                amount: toBN(payment.Amount).add(this.fee),
                            },
                        ];
                    } // Token transfer since Amount is IssuedCurrencyAmount
                    else {
                        return [
                            {
                                address: payment.Account,
                                amount: this.fee,
                            },
                        ];
                    }
                } else {
                    // Token transfer
                    return [
                        {
                            address: payment.Account,
                            amount: this.fee,
                        },
                    ];
                }
            }
            default:
                // TODO: what should be returned here?
                throw new Error(`Intended spend amounts for transaction type ${this.type} are not implemented`);
            // return [
            //    {
            //       address: this.sourceAddresses[0],
            //       amount: toBN(this.fee),
            //    },
            // ];
        }
    }

    public get assetSpentAmounts(): AddressAmount[] {
        throw new Error("Method not implemented.");
    }

    public get receivedAmounts(): AddressAmount[] {
        if (typeof this.data.result.meta === "string" || !this.data.result.meta) {
            throw new Error("Transaction meta is not available thus received amounts cannot be calculated");
        }
        const receivedAmounts: AddressAmount[] = [];
        for (const node of this.data.result.meta.AffectedNodes) {
            if (isModifiedNode(node)) {
                if (
                    node.ModifiedNode.LedgerEntryType === "AccountRoot" &&
                    node.ModifiedNode.FinalFields &&
                    node.ModifiedNode.PreviousFields &&
                    node.ModifiedNode.FinalFields.Account &&
                    node.ModifiedNode.FinalFields.Balance &&
                    node.ModifiedNode.PreviousFields.Balance
                ) {
                    // TODO: this is due to xrpl.js lib mistakes
                    const diff = toBN(node.ModifiedNode.FinalFields.Balance as string).sub(toBN(node.ModifiedNode.PreviousFields.Balance as string));
                    if (diff.gt(toBN(0))) {
                        receivedAmounts.push({
                            address: node.ModifiedNode.FinalFields.Account as string,
                            amount: diff,
                        });
                    }
                }
            } else if (isCreatedNode(node)) {
                if (node.CreatedNode.LedgerEntryType === "AccountRoot" && node.CreatedNode.NewFields && node.CreatedNode.NewFields.Account) {
                    if (node.CreatedNode.NewFields.Balance) {
                        receivedAmounts.push({
                            address: node.CreatedNode.NewFields.Account as string,
                            amount: toBN(node.CreatedNode.NewFields.Balance as string),
                        });
                    }
                }
            } else if (isDeletedNode(node)) {
                // TODO: check if true
                // Created node can't affect spend amounts
            }
        }
        return receivedAmounts;
    }

    public get intendedReceivedAmounts(): AddressAmount[] {
        if (this.successStatus === TransactionSuccessStatus.SUCCESS) {
            return this.receivedAmounts;
        }
        switch (this.type) {
            case "Payment": {
                const payment = this.data.result as Payment;

                if (this.isNativePayment) {
                    if (typeof payment.Amount === "string") {
                        return [
                            {
                                address: payment.Destination,
                                amount: toBN(payment.Amount),
                            },
                        ];
                    }
                }
                // Token transfer was intended
                return [];
            }
            default:
                throw new Error(`Intended received amounts for transaction type ${this.type} are not implemented`);
        }
    }

    public get assetReceivedAmounts(): AddressAmount[] {
        throw new Error("Method not implemented.");
    }

    public get type(): XrpTransactionTypeUnion {
        return this.data.result.TransactionType;
    }

    public get isNativePayment(): boolean {
        return this.currencyName === XRP_NATIVE_TOKEN_NAME;
    }

    //!!! issuer is sometimes important !!!
    public get currencyName(): string {
        // With ripple this is currency code
        if (this.type === "Payment") {
            if (((this.data.result as Payment).Amount as IssuedCurrencyAmount).currency) {
                return ((this.data.result as Payment).Amount as IssuedCurrencyAmount).currency;
            }
            return XRP_NATIVE_TOKEN_NAME;
        }
        // TODO Check for other types of transactions
        return "";
    }

    public get elementaryUnits(): BN {
        // TODO this is dependent on currency we are using
        return toBN(XRP_MDU);
    }

    public get successStatus(): TransactionSuccessStatus {
        if (typeof this.data.result.meta === "string" || !this.data.result.meta) {
            throw new Error("Transaction meta is not available thus transaction status cannot be extracted");
        }
        const result = this.data.result.meta.TransactionResult;
        const prefix = result.slice(0, 3) as XrpTransactionStatusPrefixes;
        // TODO: update
        // about statuses https://xrpl.org/transaction-results.html
        switch (prefix) {
            case "tes": // SUCCESS - Transaction was applied. Only final in a validated ledger.
                return TransactionSuccessStatus.SUCCESS;
            case "tec": {
                // FAILED - Transaction failed, and only the fee was charged. Only final in a validated ledger.
                const resultTec = result as XrpTransactionStatusTec;
                switch (resultTec) {
                    case "tecDST_TAG_NEEDED": //can be perceived as sender's fault if destination tag was specified
                    case "tecNO_DST":
                    case "tecNO_DST_INSUF_XRP":
                    case "tecNO_PERMISSION": //can be perceived as sender's fault if DepositPreauth tag specifically required
                        return TransactionSuccessStatus.RECEIVER_FAILURE;
                    case "tecCANT_ACCEPT_OWN_NFTOKEN_OFFER":
                    case "tecCLAIM": //unsure
                    case "tecCRYPTOCONDITION_ERROR":
                    case "tecDIR_FULL": //technically receivers fault, but so far irrelevant
                    case "tecDUPLICATE":
                    case "tecEXPIRED":
                    case "tecFAILED_PROCESSING": //unsure
                    case "tecFROZEN":
                    case "tecHAS_OBLIGATIONS":
                    case "tecINSUF_RESERVE_LINE":
                    case "tecINSUF_RESERVE_OFFER":
                    case "tecINSUFF_FEE":
                    case "tecINSUFFICIENT_FUNDS": //can be receivers fault, bu so far irrelevant
                    case "tecINSUFFICIENT_PAYMENT":
                    case "tecINSUFFICIENT_RESERVE":
                    case "tecINTERNAL": //unsure
                    case "tecINVARIANT_FAILED": //unsure
                    case "tecKILLED":
                    case "tecMAX_SEQUENCE_REACHED":
                    case "tecNEED_MASTER_KEY":
                    case "tecNFTOKEN_BUY_SELL_MISMATCH":
                    case "tecNFTOKEN_OFFER_TYPE_MISMATCH":
                    case "tecNO_ALTERNATIVE_KEY":
                    case "tecNO_AUTH": //can be receivers fault, but so far irrelevant
                    case "tecNO_ENTRY":
                    case "tecNO_ISSUER":
                    case "tecNO_LINE":
                    case "tecNO_LINE_INSUF_RESERVE":
                    case "tecNO_LINE_REDUNDANT":
                    case "tecNO_REGULAR_KEY":
                    case "tecNO_SUITABLE_NFTOKEN_PAGE":
                    case "tecNO_TARGET":
                    case "tecOBJECT_NOT_FOUND":
                    case "tecOVERSIZE": //unsure
                    case "tecOWNERS":
                    case "tecPATH_DRY": //can be receivers fault, but so far irrelevant
                    case "tecPATH_PARTIAL":
                    case "tecTOO_SOON":
                    case "tecUNFUNDED":
                    case "tecUNFUNDED_ADD":
                    case "tecUNFUNDED_PAYMENT":
                    case "tecUNFUNDED_OFFER":
                        return TransactionSuccessStatus.SENDER_FAILURE;
                    default:
                        // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
                        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
                        ((_: never): void => {})(resultTec);
                }
                break;
            }
            case "tef":
                // FAILED - The transaction cannot be applied to the server's current (in-progress) ledger or any later one. It may have already been applied, or the condition of the ledger makes it impossible to apply in the future.
                return TransactionSuccessStatus.SENDER_FAILURE;
            case "tel":
                // LOCAL_ERROR - The transaction was not applied. The transaction was not applied to the ledger because it failed local checks, such as a bad signature or an unavailable fee level.
                return TransactionSuccessStatus.SENDER_FAILURE;
            case "tem":
                // MALFORMED - The transaction was not applied. The transaction was not applied to the ledger because it was malformed in some way, such as a bad signature or an unavailable fee level.
                return TransactionSuccessStatus.SENDER_FAILURE;
            case "ter":
                // FAILED_PROCESSING - The transaction was not applied. The transaction was not applied to the ledger because it failed to meet some other constraint imposed by the server.
                return TransactionSuccessStatus.SENDER_FAILURE;
            default:
                // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
                // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
                ((_: never): void => {})(prefix);
        }
        throw new Error(`Unexpected transaction status prefix found ${prefix}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async paymentSummary<T extends XrpTransaction>(props: PaymentSummaryProps<XrpTransaction>): Promise<PaymentSummaryResponse> {
        if (this.type === "Payment" && this.isNativePayment) {
            // Is native transfer
            // Successful transaction of type payment always only one source and one receiving address
            if (TransactionSuccessStatus.SUCCESS && (this.spentAmounts.length !== 1 || this.receivedAmounts.length !== 1)) {
                return {
                    status: PaymentSummaryStatus.UnexpectedNumberOfParticipants,
                };
            }
            const spendAmount = this.spentAmounts[0];
            const receiveAmount = this.receivedAmounts[0];

            const receiveAddress = receiveAmount && receiveAmount.address ? receiveAmount.address : "";

            if (!spendAmount.address) {
                return {
                    status: PaymentSummaryStatus.NoSpentAmountAddress,
                };
            }
            // Successful payment transaction always has a receiving address
            if (TransactionSuccessStatus.SUCCESS && receiveAddress) {
                return {
                    status: PaymentSummaryStatus.NoReceiveAmountAddress,
                };
            }
            if (this.intendedSpentAmounts.length !== 1 || this.intendedReceivedAmounts.length !== 1) {
                return {
                    status: PaymentSummaryStatus.UnexpectedNumberOfParticipants,
                };
            }
            const intendedSpendAmounts = this.intendedSpentAmounts[0];
            const intendedReceivedAmounts = this.intendedReceivedAmounts[0];
            if (!intendedSpendAmounts.address) {
                return {
                    status: PaymentSummaryStatus.NoIntendedSpentAmountAddress,
                };
            }
            if (!intendedReceivedAmounts.address) {
                return {
                    status: PaymentSummaryStatus.NoIntendedReceiveAmountAddress,
                };
            }

            return {
                status: PaymentSummaryStatus.Success,
                response: {
                    blockTimestamp: this.unixTimestamp,
                    transactionHash: this.stdTxid,
                    sourceAddress: spendAmount.address,
                    sourceAddressHash: standardAddressHash(spendAmount.address),
                    receivingAddressHash: standardAddressHash(receiveAddress),
                    receivingAddress: receiveAddress,
                    spentAmount: spendAmount.amount,
                    // TODO: Check if intended sent value can be set
                    receivedAmount: this.successStatus === TransactionSuccessStatus.SUCCESS ? receiveAmount.amount : toBN(0),
                    transactionStatus: this.successStatus,
                    // For transactions that are not successful but still in block
                    intendedSourceAddressHash: standardAddressHash(intendedSpendAmounts.address),
                    intendedSourceAddress: intendedSpendAmounts.address,
                    intendedSourceAmount: toBN(intendedSpendAmounts.amount),

                    intendedReceivingAddressHash: standardAddressHash(intendedReceivedAmounts.address),
                    intendedReceivingAddress: intendedReceivedAmounts.address,
                    intendedReceivingAmount: toBN(intendedReceivedAmounts.amount),

                    oneToOne: true,
                    paymentReference: this.stdPaymentReference,
                    isFull: true,
                },
            };
        }
        return {
            status: PaymentSummaryStatus.NotNativePayment,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async balanceDecreasingSummary<XrpTransaction>({
        sourceAddressIndicator,
    }: BalanceDecreasingProps<XrpTransaction>): Promise<BalanceDecreasingSummaryResponse> {
        if (!isValidBytes32Hex(sourceAddressIndicator)) {
            return { status: BalanceDecreasingSummaryStatus.NotValidSourceAddressFormat };
        }
        const spentAmounts = this.spentAmounts;
        for (const spendAmount of spentAmounts) {
            if (spendAmount.address && standardAddressHash(spendAmount.address) === sourceAddressIndicator) {
                // We found the address we are looking for
                return {
                    status: BalanceDecreasingSummaryStatus.Success,
                    response: {
                        blockTimestamp: this.unixTimestamp,
                        transactionHash: this.stdTxid,
                        sourceAddressIndicator: sourceAddressIndicator,
                        sourceAddressHash: standardAddressHash(spendAmount.address),
                        sourceAddress: spendAmount.address,
                        spentAmount: spendAmount.amount,
                        paymentReference: this.stdPaymentReference,
                        transactionStatus: this.successStatus,
                        isFull: true,
                    },
                };
            }
        }
        const feeSigner = this.feeSignerTotalAmount;
        if (feeSigner.address && standardAddressHash(feeSigner.address) === sourceAddressIndicator) {
            // We found the address we are looking for
            return {
                status: BalanceDecreasingSummaryStatus.Success,
                response: {
                    blockTimestamp: this.unixTimestamp,
                    transactionHash: this.stdTxid,
                    sourceAddressIndicator: sourceAddressIndicator,
                    sourceAddressHash: standardAddressHash(feeSigner.address),
                    sourceAddress: feeSigner.address,
                    spentAmount: feeSigner.amount,
                    paymentReference: this.stdPaymentReference,
                    transactionStatus: this.successStatus,
                    isFull: true,
                },
            };
        }
        // We didn't find the address we are looking for
        return { status: BalanceDecreasingSummaryStatus.NoSourceAddress };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async makeFull<XrpTransaction>(transactionGetter: TransactionGetterFunction<XrpTransaction>): Promise<void> {
        return;
    }

    //////////////////////////////
    //// Xrp specific methods ////
    //////////////////////////////

    private get metaObject(): TransactionMetadata {
        const noMetaError = new Error("Transaction meta is not available");
        if (this.data.result.meta) {
            if (typeof this.data.result.meta === "string") {
                throw noMetaError;
            } else {
                return this.data.result.meta as TransactionMetadata;
            }
        }
        // We handle this in the client, but transaction metadata is provided as different named properties depending if getting transactions from block or directly from transaction hash
        if (
            (
                this.data.result as Transaction & {
                    metaData?: TransactionMetadata;
                }
            ).metaData
        ) {
            return (
                this.data.result as Transaction & {
                    metaData?: TransactionMetadata;
                }
            ).metaData as TransactionMetadata;
        }
        throw noMetaError;
    }

    public get isAccountCreate(): boolean {
        if (this.type === "Payment") {
            if (this.data.result.meta) {
                if (typeof this.data.result.meta === "string") {
                    return false;
                }
                const Meta = this.data.result.meta as TransactionMetadata;
                for (const elem of Meta.AffectedNodes) {
                    if ("CreatedNode" in elem) {
                        if ("Account" in elem.CreatedNode.NewFields) {
                            if (elem.CreatedNode.NewFields.Account === this.receivingAddresses[0]) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            return false;
        }
        return false;
    }
}
