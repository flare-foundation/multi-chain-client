import BN from "bn.js";
import { TransactionSuccessStatus } from "../../types/genericMccTypes";
import { IUtxoGetTransactionRes, IUtxoTransactionAdditionalData, IUtxoVinTransaction, IUtxoVinVoutsMapper, IUtxoVoutTransaction } from "../../types/utxoTypes";
import { bytesToHex } from "../../utils/algoUtils";
import { bech32Decode } from "../../utils/bech32";
import { BTC_MDU } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { ZERO_BYTES_32, btcBase58Decode, isValidBytes32Hex, prefix0x, toBN, toHex, unPrefix0x } from "../../utils/utils";
import { WordToOpcode } from "../../utils/utxoUtils";
import { AddressAmount, TransactionBase } from "../TransactionBase";

export type UtxoTransactionTypeOptions = "coinbase" | "payment" | "partial_payment" | "full_payment";
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
                amount: this.isValidPkscript(vout.n) ? this.toBnValue(vout.value) : toBN(0), //If pkscript is not valid, value is set to 0.
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
            return "payment";
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
        if (hasDefined) {
            return "partial_payment";
        }
        return "payment";
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

    /////////////////////////////////////////////////////
    //// Scripts and output transaction script types ////
    /////////////// LOCKING SCRIPT METHODS //////////////
    /////////////////////////////////////////////////////

    /**
     * Validate that the pkscript and address for a given vout index match.
     * @param voutIndex
     */
    public abstract isValidPkscript(voutIndex: number): boolean;

    /**
     * Weather a output is a valid "nice" payment output currently P2PKH or P2PK
     * @param voutIndex index of the output we are checking
     * @returns weather a vout script is standard P2PKH or P2PK
     */
    public isValidPaymentScript(voutIndex: number): boolean {
        return this.isP2PKH(voutIndex) || this.isP2PK(voutIndex);
    }

    //// P2PKH

    /**
     * Checks if the output on index `voutIndex` is P2PKH. (Pay to public key hash)
     * @param voutIndex index of the output we are checking
     * @returns weather a vout script is standard P2PKH
     */
    public isP2PKH(voutIndex: number): boolean {
        const vout = this.extractVoutAt(voutIndex);
        const script_commands = vout.scriptPubKey.asm.split(" ");
        return (
            script_commands.length === 5 &&
            script_commands[0] === "OP_DUP" &&
            script_commands[1] === "OP_HASH160" &&
            script_commands[3] === "OP_EQUALVERIFY" &&
            script_commands[4] === "OP_CHECKSIG"
        );
    }

    /**
     * Checks that address specified by `address` is actually the one that can redeem the script for a valid P2PKH output script
     * @param voutIndex index of the output we are checking
     * @returns weather the output script is spendable by address
     */
    public isValidP2PKH(voutIndex: number): boolean {
        if (!this.isP2PKH(voutIndex)) {
            return false;
        }
        const vout = this.extractVoutAt(voutIndex);
        // console.dir(vout);
        const address = vout.scriptPubKey.address;
        if (!address) {
            return false;
        }
        const addressHex = btcBase58Decode(address);
        // This is the version check for P2PKH
        if (addressHex[0] !== 0x00) {
            return false;
        }
        const xx = bytesToHex(addressHex.slice(1, 21));
        const script_commands = vout.scriptPubKey.asm.split(" ");
        const hash = script_commands[2];
        return hash === xx;
    }

    //// P2WPKH

    public isP2WPKH(voutIndex: number): boolean {
        const vout = this.extractVoutAt(voutIndex);
        console.dir(vout);
        const script_commands = vout.scriptPubKey.asm.split(" ");
        return script_commands.length === 2 && script_commands[0] === "0";
    }

    //this is to ok
    public isValidP2WPKH(voutIndex: number): boolean {
        if (!this.isP2WPKH(voutIndex)) {
            return false;
        }
        const vout = this.extractVoutAt(voutIndex);
        const address = vout.scriptPubKey.address;
        if (!address) {
            return false;
        }
        // let addressData: string;
        // testnet must start with tb1
        // if (address.startsWith("bc1")) {
        //    addressData = address.slice(3);
        // } else {
        //    return false;
        // }
        const addressHex = bech32Decode(address);
        console.dir(addressHex);
        // This is the version check for P2PKH
        const script_commands = vout.scriptPubKey.asm.split(" ");
        const hash = script_commands[1];
        return false;
    }

    //// P2PK

    /**
     * Checks if the output on index `voutIndex` is P2PK. (Pay to public key)
     * @param voutIndex index of the output we are checking
     * @returns weather a vout script is standard P2PK
     */
    public isP2PK(voutIndex: number): boolean {
        const vout = this.extractVoutAt(voutIndex);
        const script_commands = vout.scriptPubKey.asm.split(" ");
        return script_commands.length === 2 && script_commands[1] === "OP_CHECKSIG";
    }

    public isValidP2PK(voutIndex: number): boolean {
        if (!this.isP2PK(voutIndex)) {
            return false;
        }
        throw new Error("Not implemented");
    }
}
