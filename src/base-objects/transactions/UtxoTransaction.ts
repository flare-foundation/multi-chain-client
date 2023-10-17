import BN from "bn.js";
import { TransactionSuccessStatus } from "../../types/genericMccTypes";
import { IUtxoGetTransactionRes, IUtxoTransactionAdditionalData, IUtxoVinTransaction, IUtxoVinVoutsMapper, IUtxoVoutTransaction } from "../../types/utxoTypes";
import { BTC_MDU } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { ZERO_BYTES_32, isValidBytes32Hex, prefix0x, standardAddressHash, toBN, toHex, unPrefix0x } from "../../utils/utils";
import { WordToOpcode } from "../../utils/utxoUtils";
import {
    AddressAmount,
    BalanceDecreasingSummaryResponse,
    BalanceDecreasingSummaryStatus,
    PaymentSummaryProps,
    PaymentSummaryResponse,
    PaymentSummaryStatus,
    TransactionBase,
} from "../TransactionBase";

export type UtxoTransactionTypeOptions = "coinbase" | "payment";
// Transaction types and their description
// - coinbase        : transaction that mints new coins
// - payment         : what you get from node
// - partial_payment : transaction with some vout of vins added to additional data
// - full_payment    : transaction with vouts for all vins added to additional data
//@Managed()
export abstract class UtxoTransaction extends TransactionBase<IUtxoGetTransactionRes> {
    protected get data(): IUtxoGetTransactionRes {
        return this.privateData;
    }

    public get txid(): string {
        return this.data.txid;
    }

    public get stdTxid(): string {
        return unPrefix0x(this.txid);
    }

    public get reference(): string[] {
        const references = [];
        for (const vo of this.data.vout) {
            if (vo.scriptPubKey.hex.substring(0, 2) == unPrefix0x(toHex(WordToOpcode.OP_RETURN))) {
                const dataSplit = vo.scriptPubKey.asm.split(" ");
                references.push(dataSplit[1]);
            }
        }
        return references;
    }

    public get stdPaymentReference(): string {
        let paymentReference = this.reference.length === 1 ? prefix0x(this.reference[0]) : "";
        if (!isValidBytes32Hex(paymentReference)) {
            paymentReference = ZERO_BYTES_32;
        }
        return paymentReference;
    }

    public get unixTimestamp(): number {
        return this.data.blocktime;
    }

    public get sourceAddresses(): (string | undefined)[] {
        if (this.type === "coinbase") {
            // Coinbase transactions mint coins
            return [undefined];
        }
        {
            return this.data.vin.map((vin) => {
                return vin.prevout?.scriptPubKey.address; // are we sure that every prevout has an address
            });
        }
    }

    public get receivingAddresses(): (string | undefined)[] {
        /* istanbul ignore if */
        // Transaction should always have vout array
        if (!this.data.vout) {
            return [];
        }
        return this.data.vout.map((vout: IUtxoVoutTransaction) => vout.scriptPubKey.address);
    }

    toBnValue(value: number | undefined): BN {
        if (value === undefined) {
            return toBN(0);
        }
        return toBN(Math.round(value * BTC_MDU).toFixed(0));
    }
    reducerFunctionAdditionalDataVinOuts = (prev: BN, vout: IUtxoVinVoutsMapper | undefined) => prev.add(this.toBnValue(vout?.vinvout?.value));
    reducerFunctionPrevouts = (prev: BN, vin: IUtxoVinTransaction) => prev.add(this.toBnValue(vin?.prevout?.value));
    reducerFunctionVouts = (prev: BN, vout: IUtxoVoutTransaction) => prev.add(this.toBnValue(vout.value));

    public get fee(): BN {
        switch (this.type) {
            case "payment": {
                let fee = new BN(0);
                this.spentAmounts.forEach((addressAmount) => {
                    fee.add(addressAmount.amount);
                });
                this.receivedAmounts.forEach((addressAmount) => {
                    fee.sub(addressAmount.amount);
                });
                return fee;
            }
            case "coinbase": {
                // Coinbase transactions mint coins
                return toBN(0);
            }
        }
    }

    public get feeSignerTotalAmount(): AddressAmount {
        throw new Error("Method not implemented.");
    }

    public get spentAmounts(): AddressAmount[] {
        if (this.type === "coinbase") {
            // Coinbase transactions mint coins
            return [
                {
                    amount: toBN(0),
                } as AddressAmount,
            ];
        }

        return this.data.vin.map((mapper: IUtxoVinTransaction | undefined) => {
            let amount: BN;
            if (mapper == undefined) {
                amount = toBN(0);
            } else {
                amount = toBN(Math.round((mapper?.prevout?.value || 0) * this.elementaryUnits.toNumber()).toFixed(0));
            }

            return {
                address: mapper?.prevout?.scriptPubKey?.address,
                amount: amount,
                utxo: mapper?.prevout?.n,
            } as AddressAmount;
        });
    }

    public get intendedSpentAmounts(): AddressAmount[] {
        return this.spentAmounts;
    }

    public get receivedAmounts(): AddressAmount[] {
        return this.data.vout.map((vout: IUtxoVoutTransaction) => {
            return {
                address: vout.scriptPubKey.address,
                amount: this.toBnValue(vout.value),
                utxo: vout.n,
            } as AddressAmount;
        });
    }

    public get intendedReceivedAmounts(): AddressAmount[] {
        return this.receivedAmounts;
    }

    public get type(): UtxoTransactionTypeOptions {
        if (this.data.vin.length === 0 || this.data.vin[0].coinbase) {
            return "coinbase";
        }
        return "payment";
    }

    public get isNativePayment(): boolean {
        // On these chains there are no other types of transactions
        return true;
    }

    public get successStatus(): TransactionSuccessStatus {
        return TransactionSuccessStatus.SUCCESS;
    }

    public paymentSummary({ inUtxo, outUtxo }: PaymentSummaryProps): PaymentSummaryResponse {
        try {
            this.assertValidVinIndex(inUtxo);
        } catch (e) {
            return { status: PaymentSummaryStatus.InvalidInUtxo };
        }
        try {
            this.assertValidVoutIndex(outUtxo);
        } catch (e) {
            return { status: PaymentSummaryStatus.InvalidOutUtxo };
        }

        if (this.type === "coinbase") {
            return { status: PaymentSummaryStatus.Coinbase };
        }
        const spentAmount = this.spentAmounts[inUtxo];
        if (!spentAmount.address) {
            return { status: PaymentSummaryStatus.NoSpentAmountAddress };
        }
        const receiveAmount = this.receivedAmounts[outUtxo];
        if (!receiveAmount.address) {
            return { status: PaymentSummaryStatus.NoReceiveAmountAddress };
        }

        // Extract addresses from input and output fields
        const sourceAddress = spentAmount.address;
        const receivingAddress = receiveAmount.address;

        // We will update this once we iterate over inputs and outputs if we have full transaction
        let oneToOne: boolean = true;

        let inFunds = toBN(0);
        let returnFunds = toBN(0);
        let outFunds = toBN(0);
        let inFundsOfReceivingAddress = toBN(0);

        for (const vinAmount of this.spentAmounts) {
            if (sourceAddress && vinAmount.address === sourceAddress) {
                inFunds = inFunds.add(vinAmount.amount);
            }
            if (receivingAddress && vinAmount.address === receivingAddress) {
                inFundsOfReceivingAddress = inFundsOfReceivingAddress.add(vinAmount.amount);
            }
            if (oneToOne && vinAmount.address != sourceAddress && vinAmount.address != receivingAddress) {
                oneToOne = false;
            }
        }
        for (const voutAmount of this.receivedAmounts) {
            if (sourceAddress && voutAmount.address === sourceAddress) {
                returnFunds = returnFunds.add(voutAmount.amount);
            }
            if (receivingAddress && voutAmount.address === receivingAddress) {
                outFunds = outFunds.add(voutAmount.amount);
            }
            // Outputs without address do not break one-to-one condition
            if (oneToOne && !voutAmount.address && voutAmount.amount.gt(toBN(0))) {
                oneToOne = false;
            }
            if (oneToOne && voutAmount.address && voutAmount.address != sourceAddress && voutAmount.address != receivingAddress) {
                oneToOne = false;
            }
        }
        return {
            status: PaymentSummaryStatus.Success,
            response: {
                blockTimestamp: this.unixTimestamp,
                transactionHash: this.stdTxid,
                sourceAddressHash: standardAddressHash(sourceAddress),
                sourceAddress,
                receivingAddress,
                receivingAddressHash: standardAddressHash(receivingAddress),
                spentAmount: inFunds.sub(returnFunds),
                receivedAmount: outFunds.sub(inFundsOfReceivingAddress),
                transactionStatus: this.successStatus,
                paymentReference: this.stdPaymentReference,
                intendedSourceAmount: inFunds.sub(returnFunds),
                intendedReceivingAddressHash: standardAddressHash(receivingAddress),
                intendedReceivingAddress: receivingAddress,
                intendedReceivingAmount: outFunds.sub(inFundsOfReceivingAddress),
                oneToOne,
            },
        };
    }

    public balanceDecreasingSummary(sourceAddressIndicator: string): BalanceDecreasingSummaryResponse {
        // We expect sourceAddressIndicator to be utxo vin index (as hex string)
        if (!isValidBytes32Hex(sourceAddressIndicator)) {
            return { status: BalanceDecreasingSummaryStatus.NotValidSourceAddressFormat };
        }
        const vinIndex = parseInt(sourceAddressIndicator, 16);
        if (isNaN(vinIndex)) {
            return { status: BalanceDecreasingSummaryStatus.NotValidSourceAddressFormat };
        }
        try {
            this.assertValidVinIndex(vinIndex);
        } catch (e) {
            return { status: BalanceDecreasingSummaryStatus.InvalidInUtxo };
        }
        const transactionType: UtxoTransactionTypeOptions = this.type;
        switch (transactionType) {
            case "coinbase": {
                return { status: BalanceDecreasingSummaryStatus.Coinbase };
            }
            case "payment": {
                const spentAmounts = this.spentAmounts;
                const spentAmount = spentAmounts[vinIndex];
                const sourceAddress = spentAmount.address;
                if (sourceAddress) {
                    let inFunds = toBN(0);
                    let returnFunds = toBN(0);

                    for (const vinAmount of this.spentAmounts) {
                        if (vinAmount.address === sourceAddress) {
                            inFunds = inFunds.add(vinAmount.amount);
                        }
                    }
                    for (const voutAmount of this.receivedAmounts) {
                        if (voutAmount.address === sourceAddress) {
                            returnFunds = returnFunds.add(voutAmount.amount);
                        }
                    }
                    return {
                        status: BalanceDecreasingSummaryStatus.Success,
                        response: {
                            blockTimestamp: this.unixTimestamp,
                            transactionHash: this.stdTxid,
                            sourceAddressIndicator: sourceAddressIndicator,
                            sourceAddressHash: standardAddressHash(sourceAddress),
                            sourceAddress: sourceAddress,
                            spentAmount: inFunds.sub(returnFunds),
                            transactionStatus: this.successStatus,
                            paymentReference: this.stdPaymentReference,
                            isFull: true,
                        },
                    };
                } else {
                    // The input has no address, the type is wrongly extracted (Should not happen)
                    return { status: BalanceDecreasingSummaryStatus.InvalidTransactionDataObject };
                }
                return { status: BalanceDecreasingSummaryStatus.Success }; // TODO: implement
            }
            default:
                // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
                // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
                ((_: never): void => {})(transactionType);
        }

        // We didn't find the address we are looking for
        return { status: BalanceDecreasingSummaryStatus.NoSourceAddress };
    }

    ///////////////////////////////
    //// Utxo specific methods ////
    ///////////////////////////////

    /**
     * Asserts whether the vin index is in valid range. If not, exception is thrown.
     * @param vinIndex vin index
     */
    assertValidVinIndex(vinIndex: number) {
        if (vinIndex < 0 || vinIndex >= this.sourceAddresses.length) {
            throw new mccError(mccErrorCode.InvalidParameter, Error("Invalid vin index"));
        }
    }

    /**
     * Asserts whether the vout index is in valid range. If not, exception is thrown.
     * @param voutIndex vout index
     */
    assertValidVoutIndex(voutIndex: number) {
        if (voutIndex < 0 || voutIndex >= this.receivingAddresses.length) {
            throw new mccError(mccErrorCode.InvalidParameter, Error("Invalid vout index"));
        }
    }
}
