import { IUtxoGetTransactionRes, IUtxoTransactionAdditionalData, IUtxoVinTransaction, IUtxoVinVoutsMapper, IUtxoVoutTransaction } from "../../types";
import { BTC_MDU, DOGE_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { isValidBytes32Hex, standardAddressHash, toBN } from "../../utils/utils";
import {
    BalanceDecreasingProps,
    BalanceDecreasingSummaryResponse,
    BalanceDecreasingSummaryStatus,
    PaymentSummaryProps,
    PaymentSummaryResponse,
    PaymentSummaryStatus,
    TransactionGetterFunction,
} from "../TransactionBase";
import { DogeAddress } from "../addressObjects/DogeAddress";
import { UtxoTransaction } from "./UtxoTransaction";

export class DogeTransaction extends UtxoTransaction {
    constructor(data: IUtxoGetTransactionRes, additionalData?: IUtxoTransactionAdditionalData) {
        super(data, additionalData);
        this.data.vout.forEach((vout) => {
            this.processOutput(vout);
        });
        this.synchronizeAdditionalData();
        this.assertAdditionalData();
    }

    public isValidPkscript(index: number): boolean {
        const vout = this.extractVoutAt(index);
        if (!vout.scriptPubKey.address) return true; //OP_RETURN
        const address = new DogeAddress(vout.scriptPubKey.address);
        return address.addressToPkscript() == vout.scriptPubKey.hex;
    }

    public get currencyName(): string {
        return DOGE_NATIVE_TOKEN_NAME;
    }

    public async paymentSummary<DogeTransaction>({
        transactionGetter,
        inUtxo,
        outUtxo,
    }: PaymentSummaryProps<DogeTransaction>): Promise<PaymentSummaryResponse> {
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

        // if (transactionGetter === undefined) {
        //     return { status: PaymentSummaryStatus.NoTransactionGetterProvided };
        // }
        await this.vinVoutAt(inUtxo, transactionGetter);

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
        const isFull = this.type === "full_payment";

        if (isFull) {
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

                    // Intended and actual amounts are the same for utxo transactions
                    intendedSourceAddressHash: standardAddressHash(sourceAddress),
                    intendedSourceAddress: sourceAddress,
                    intendedSourceAmount: inFunds.sub(returnFunds),

                    intendedReceivingAddressHash: standardAddressHash(receivingAddress),
                    intendedReceivingAddress: receivingAddress,
                    intendedReceivingAmount: outFunds.sub(inFundsOfReceivingAddress),
                    oneToOne,
                    isFull,
                },
            };
        } else {
            // Since we don't have all inputs "decoded" we can't be sure that transaction is one-to-one
            oneToOne = false;
            const spentAmount = sourceAddress && inUtxo != null ? this.spentAmounts[inUtxo].amount : toBN(0);
            const receivedAmount = receivingAddress && outUtxo != null ? this.receivedAmounts[outUtxo].amount : toBN(0);

            return {
                status: this.isValidPkscript(outUtxo) ? PaymentSummaryStatus.Success : PaymentSummaryStatus.InvalidPkscript,
                response: {
                    blockTimestamp: this.unixTimestamp,
                    transactionHash: this.stdTxid,
                    sourceAddress,
                    sourceAddressHash: standardAddressHash(sourceAddress),
                    receivingAddress,
                    receivingAddressHash: standardAddressHash(receivingAddress),
                    spentAmount,
                    receivedAmount,
                    paymentReference: this.stdPaymentReference,
                    transactionStatus: this.successStatus,
                    // Intended and actual amounts are the same for utxo transactions
                    intendedSourceAddressHash: standardAddressHash(sourceAddress),
                    intendedSourceAddress: sourceAddress,
                    intendedSourceAmount: spentAmount,

                    intendedReceivingAddressHash: standardAddressHash(receivingAddress),
                    intendedReceivingAddress: receivingAddress,
                    intendedReceivingAmount: receivedAmount,
                    oneToOne,
                    isFull,
                },
            };
        }
    }

    public async balanceDecreasingSummary<DogeTransaction>({
        sourceAddressIndicator,
        transactionGetter,
    }: BalanceDecreasingProps<DogeTransaction>): Promise<BalanceDecreasingSummaryResponse> {
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
        if (this.isValidAdditionalData()) {
            const spentAmounts = this.spentAmounts;
            const spentAmount = spentAmounts[vinIndex];
            if (spentAmount.address) {
                return {
                    status: BalanceDecreasingSummaryStatus.Success,
                    response: {
                        blockTimestamp: this.unixTimestamp,
                        transactionHash: this.stdTxid,
                        sourceAddressIndicator: sourceAddressIndicator,
                        sourceAddressHash: standardAddressHash(spentAmount.address),
                        sourceAddress: spentAmount.address,
                        spentAmount: spentAmount.amount,
                        transactionStatus: this.successStatus,
                        paymentReference: this.stdPaymentReference,
                        isFull: true,
                    },
                };
            }
            // Else we have to extract vin
        }
        if (!transactionGetter) {
            throw new Error("Transaction getter not provided");
        }
        const vinVout = await this.extractVinVoutAt(vinIndex, transactionGetter);

        if (vinVout?.vinvout?.scriptPubKey?.address) {
            return {
                status: BalanceDecreasingSummaryStatus.Success,
                response: {
                    blockTimestamp: this.unixTimestamp,
                    transactionHash: this.stdTxid,
                    sourceAddressIndicator: sourceAddressIndicator,
                    sourceAddressHash: standardAddressHash(vinVout.vinvout.scriptPubKey.address),
                    sourceAddress: vinVout.vinvout.scriptPubKey.address,
                    spentAmount: toBN(Math.round((vinVout.vinvout.value || 0) * BTC_MDU).toFixed(0)),
                    transactionStatus: this.successStatus,
                    paymentReference: this.stdPaymentReference,
                    isFull: false,
                },
            };
        }
        // We didn't find the address we are looking for
        return { status: BalanceDecreasingSummaryStatus.NoSourceAddress };
    }

    public async makeFull<DogeTransaction>(transactionGetter: TransactionGetterFunction<DogeTransaction>): Promise<void> {
        await this.makeFullPayment(transactionGetter);
    }

    ///////////////////////////////
    //// Utxo specific methods ////
    ///////////////////////////////

    /**
     * Asserts whether vinvouts Mapper is full mapper and only has unique and matching indices
     * This mapper is required to make full transactions on DOGE chain
     */
    assertAdditionalData() {
        if (this.additionalData) {
            if (this.additionalData.vinouts?.length !== this.data.vin.length) {
                throw new mccError(mccErrorCode.InvalidParameter, Error("Bad format, Additional data vinvouts and data vin length mismatch"));
            }
            this.additionalData.vinouts.forEach((vinvout, ind) => {
                if (vinvout && vinvout.index !== ind) {
                    throw new mccError(mccErrorCode.InvalidParameter, Error("Additional data corrupted: indices mismatch"));
                }
            });
        }
    }

    /**
     * Checks that additional data mapper for making full transactions is correctly formatted
     * @returns boolean indicator if the object is correctly formatted
     * This mapper is required to make full transactions on DOGE chain
     */
    isValidAdditionalData(): boolean {
        if (this.additionalData) {
            if (this.additionalData.vinouts?.length !== this.data.vin.length) {
                return false;
            }
            this.additionalData.vinouts.forEach((vinvout, ind) => {
                if (vinvout && vinvout.index !== ind) {
                    return false;
                }
            });
            return true;
        }
        return false;
    }

    synchronizeAdditionalData() {
        const tempAdditionalData = this.additionalData;

        this.additionalData = {
            vinouts: new Array(this.data.vin.length).fill(undefined),
        };
        if (tempAdditionalData?.vinouts) {
            for (const vinvout of tempAdditionalData.vinouts) {
                if (vinvout) {
                    if (vinvout.index < 0 || vinvout.index >= this.data.vin.length || !this.additionalData || !this.additionalData.vinouts) {
                        throw new mccError(mccErrorCode.InvalidParameter, new Error("vinvout wrong index out of range"));
                    }
                    this.additionalData.vinouts[vinvout.index] = vinvout;
                    this.processOutput(vinvout.vinvout);
                }
            }
        }
    }

    /**
     *
     * @param vinIndex vin index
     * @returns vin on vin index
     */
    extractVinAt(vinIndex: number): IUtxoVinTransaction {
        this.assertValidVinIndex(vinIndex);
        return this.data.vin[vinIndex];
    }

    /**
     * Gets the vout corresponding to vin in the given vin index. If the vout is not fetched, the
     * input transaction is read and the corresponding vout is obtained
     * @param vinIndex vin index
     * @param client mcc client for fetching input the transactions
     * @returns input vout of the relevant utxo of the input transaction on the vin on the index `vinIndex`
     */
    private async extractVinVoutAt(vinIndex: number, transactionGetter: TransactionGetterFunction<DogeTransaction>): Promise<IUtxoVinVoutsMapper> {
        const vinObject = this.extractVinAt(vinIndex);
        if (!vinObject.txid) {
            return {
                index: vinIndex,
                vinvout: undefined,
            };
        }
        const connectedTrans = await transactionGetter(vinObject.txid);
        if (connectedTrans === null) {
            return {
                index: vinIndex,
                vinvout: undefined,
            };
        }
        return {
            index: vinIndex,
            vinvout: connectedTrans.extractVoutAt(vinObject.vout || 0),
        };
    }

    /**
     * Gets the vout corresponding to vin in the given vin index. If it is not stored in the additionalData,
     * it's fetched and updated using the client.
     * @param vinIndex vin index
     * @param client mcc client to fetch transaction data
     * @returns input vout of the relevant utxo of the input transaction on the vin on the index `vinIndex`
     */
    public async vinVoutAt(vinIndex: number, transactionGetter?: TransactionGetterFunction<DogeTransaction>) {
        // note: vinouts list is always initialized
        if (!this.additionalData) {
            this.additionalData = {
                vinouts: new Array(this.data.vin.length).fill(undefined),
            };
        }
        if (!this.additionalData || !this.additionalData.vinouts) {
            throw new mccError(mccErrorCode.NotImplemented, new Error(`Can not happen`));
        }
        let vinVout = this.additionalData.vinouts[vinIndex];
        if (vinVout) {
            return vinVout;
        }
        if (!transactionGetter) {
            throw new Error("Transaction getter not provided");
        }
        vinVout = await this.extractVinVoutAt(vinIndex, transactionGetter);
        this.additionalData.vinouts[vinIndex] = vinVout;
        return vinVout;
    }

    /**
     * Checks if the input on index `vinIndex` is fetched.
     * @param vinIndex vin index
     * @returns true if input on the index `vinIndex` is already fetched.
     */
    public isSyncedVinIndex(vinIndex: number): boolean {
        this.assertValidVinIndex(vinIndex);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return !!this.additionalData!.vinouts![vinIndex];
    }

    /**
     * Fetches all the vin data from input transactions and makes the payment full_payment.
     * @param client mcc client to use for fetching input data
     */
    public async makeFullPayment(transactionGetter: TransactionGetterFunction<DogeTransaction>) {
        const promises = [];
        this.synchronizeAdditionalData();
        for (let i = 0; i < this.data.vin.length; i++) {
            promises.push(this.vinVoutAt(i, transactionGetter));
        }
        await Promise.all(promises);
    }

    /**
     * Doge has additional brackets around addresses in out tx
     * @param vout
     * @returns
     */
    private processOutput(vout: IUtxoVoutTransaction | undefined) {
        if (!vout) {
            return;
        }
        if (vout.scriptPubKey.address) {
            return;
        }
        if (vout.scriptPubKey.addresses && vout.scriptPubKey.addresses.length === 1) {
            vout.scriptPubKey.address = vout.scriptPubKey.addresses[0];
        }
        // otherwise `address` stays undefined
    }
}
