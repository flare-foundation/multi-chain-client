import BN from "bn.js";
import { TransactionSuccessStatus } from "../../types/genericMccTypes";
import { IUtxoGetTransactionRes, IUtxoTransactionAdditionalData, IUtxoVinTransaction, IUtxoVinVoutsMapper, IUtxoVoutTransaction } from "../../types/utxoTypes";
import { BTC_MDU } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { ZERO_BYTES_32, isValidBytes32Hex, prefix0x, toBN, toHex, unPrefix0x } from "../../utils/utils";
import { WordToOpcode } from "../../utils/utxoUtils";
import { AddressAmount, TransactionBase } from "../TransactionBaseOld";

export type UtxoTransactionTypeOptions = "coinbase" | "partial_payment" | "full_payment";
// Transaction types and their description
// - coinbase        : transaction that mints new coins
// - payment         : what you get from node
// - partial_payment : transaction with some vout of vins added to additional data
// - full_payment    : transaction with vouts for all vins added to additional data
//@Managed()
export abstract class UtxoTransaction<T> extends TransactionBase<T> {
    protected get data(): IUtxoGetTransactionRes {
        return this.privateData as IUtxoGetTransactionRes;
    }

    protected get additionalData(): IUtxoTransactionAdditionalData | undefined {
        return this.privateAdditionalData as IUtxoTransactionAdditionalData | undefined;
    }

    protected set additionalData(data: IUtxoTransactionAdditionalData | undefined) {
        this.privateAdditionalData = data;
    }

    // constructor(data: IUtxoGetTransactionRes, additionalData?: IUtxoTransactionAdditionalData) {
    //     super(data, additionalData);
    //     this.data.vout.forEach((vout) => {
    //         this.processOutput(vout);
    //     });
    //     this.synchronizeAdditionalData();
    //     this.assertAdditionalData();
    // }

    public get txid(): string {
        return this.data.txid;
    }

    public get stdTxid(): string {
        return unPrefix0x(this.txid);
    }

    public get hash(): string {
        return this.data.hash;
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
        if (!this.additionalData || !this.additionalData.vinouts) {
            return [undefined];
        }
        return this.additionalData.vinouts.map((mapper: IUtxoVinVoutsMapper | undefined) => mapper?.vinvout?.scriptPubKey.address);
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
        if (this.type === "full_payment") {
            if (!this.additionalData || !this.additionalData.vinouts) {
                throw new mccError(mccErrorCode.InvalidTransaction, Error(`Transaction was not made full`));
            }
            const inSum = this.additionalData.vinouts.reduce(this.reducerFunctionAdditionalDataVinOuts, toBN(0));
            const outSum = this.data.vout.reduce(this.reducerFunctionVouts, toBN(0));
            return inSum.sub(outSum);
        }
        if (this.type === "coinbase") {
            // Coinbase transactions mint coins
            return toBN(0);
        }
        throw new mccError(mccErrorCode.InvalidResponse, Error("fee can't be calculated for `payment` and `partial_payment` transaction types"));
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

        if (!this.additionalData || !this.additionalData.vinouts) {
            return [
                {
                    amount: toBN(0),
                } as AddressAmount,
            ];
        }

        return this.additionalData.vinouts.map((mapper: IUtxoVinVoutsMapper | undefined) => {
            let amount: BN;
            if (mapper == undefined) {
                amount = toBN(0);
            } else {
                amount = toBN(Math.round((mapper?.vinvout?.value || 0) * BTC_MDU).toFixed(0));
            }

            return {
                address: mapper?.vinvout?.scriptPubKey?.address,
                amount: amount,
                utxo: mapper?.vinvout?.n,
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
        let hasUndefined = false;
        let hasDefined = false;
        if (!this.additionalData || !this.additionalData.vinouts) {
            return "partial_payment";
        }
        for (let i = 0; i < this.additionalData.vinouts.length; i++) {
            const vinOut = this.additionalData.vinouts[i];
            if (vinOut === undefined) {
                hasUndefined = true;
            } else {
                hasDefined = true;
            }
        }

        if (hasDefined && !hasUndefined) {
            return "full_payment";
        }
        return "partial_payment";
    }

    public get isNativePayment(): boolean {
        // On these chains there are no other types of transactions
        return true;
    }

    public get elementaryUnits(): BN {
        return toBN(BTC_MDU);
    }

    public get successStatus(): TransactionSuccessStatus {
        return TransactionSuccessStatus.SUCCESS;
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

    /**
     * Extract vout on vout index. If vout index is not valid or data is corrupted, exception is thrown.
     * @param voutIndex vout index
     * @returns vout on vout index
     */
    extractVoutAt(voutIndex: number): IUtxoVoutTransaction {
        this.assertValidVoutIndex(voutIndex);
        const toReturn = this.data.vout[voutIndex];
        if (toReturn.n !== voutIndex) {
            throw new mccError(
                mccErrorCode.InvalidParameter,
                new Error(`Vin and vout transaction miss match; requested index ${voutIndex}, found index ${toReturn.n}`)
            );
        }
        return toReturn;
    }
}
