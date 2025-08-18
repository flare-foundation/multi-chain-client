import { TransactionSuccessStatus } from "../../types/genericMccTypes";
import { IUtxoGetTransactionRes, IUtxoVoutTransaction, hasPrevouts, isCoinbase } from "../../types/utxoTypes";
import { mccError, mccErrorCode } from "../../utils/errors";
import { MccError, ZERO_BYTES_32, isValidBytes32Hex, prefix0x, standardAddressHash, toHex, unPrefix0x } from "../../utils/utils";
import { WordToOpcode } from "../../utils/utxoUtils";
import {
    AddressAmount,
    BalanceDecreasingSummaryResponse,
    BalanceDecreasingSummaryStatus,
    PaymentNonexistenceSummaryResponse,
    PaymentNonexistenceSummaryStatus,
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
            if (vo.scriptPubKey.hex.substring(0, 2) === unPrefix0x(toHex(WordToOpcode.OP_RETURN))) {
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
        return this.data.mediantime || -1;
    }

    public get sourceAddresses(): (string | undefined)[] {
        if (isCoinbase(this.data)) {
            // Coinbase transactions mint coins
            return [undefined];
        } else if (hasPrevouts(this.data)) {
            return this.data.vin.map((vin) => {
                return vin.prevout.scriptPubKey.address; // are we sure that every prevout has an address
            });
            //this means our assumptions on the transaction data are faulty
        } else throw MccError(`transaction ${this.txid} that does not have prevout and is not coinbase`);
    }

    public get receivingAddresses(): (string | undefined)[] {
        /* istanbul ignore if */
        // Transaction should always have vout array
        if (!this.data.vout) {
            return [];
        }
        return this.data.vout.map((vout: IUtxoVoutTransaction) => vout.scriptPubKey.address);
    }

    abstract get elementaryUnitsExponent(): number;

    /**
     * Returns value in minimal devisable units
     * @param value is stored in decimal with 1 representing the basic unit (BTC)
     * @returns
     */
    toBigIntValue(value: number | string | undefined): bigint {
        if (value === undefined) {
            return BigInt(0);
        } else if (typeof value === "number") {
            let valueStr = value.toFixed(this.elementaryUnitsExponent);
            valueStr = valueStr.replace(".", "");
            return BigInt(valueStr);
        } else {
            const split = value.split(".");
            if (split.length === 1) return BigInt(value);
            else if (split.length === 2) {
                const valueStr = split[0].concat(split[1].padEnd(this.elementaryUnitsExponent, "0"));
                return BigInt(valueStr);
            }
            throw Error(`${value} is not a valid numeric string or number`);
        }
    }

    public get fee(): bigint {
        switch (this.type) {
            case "payment": {
                let fee = BigInt(0);

                this.spentAmounts.forEach((addressAmount) => {
                    fee = fee + addressAmount.amount;
                });

                this.receivedAmounts.forEach((addressAmount) => {
                    fee = fee - addressAmount.amount;
                });
                return fee;
            }
            case "coinbase": {
                // Coinbase transactions mint coins
                return BigInt(0);
            }
        }
    }

    public get feeSignerTotalAmount(): AddressAmount {
        throw new Error("Method not implemented.");
    }

    public get spentAmounts(): AddressAmount[] {
        if (isCoinbase(this.data)) {
            // Coinbase transactions mint coins
            return [
                {
                    amount: BigInt(0),
                } as AddressAmount,
            ];
        } else if (hasPrevouts(this.data)) {
            return this.data.vin.map((mapper) => {
                let amount: bigint;
                if (mapper === undefined) {
                    amount = BigInt(0);
                } else {
                    amount = this.toBigIntValue(mapper.prevout.value || 0);
                }
                return {
                    address: mapper?.prevout?.scriptPubKey?.address,
                    amount: amount,
                    utxo: mapper?.vout,
                } as AddressAmount;
            });
        } else throw MccError(`transaction ${this.txid} that does not have prevout and is not coinbase`);
    }

    public get intendedSpentAmounts(): AddressAmount[] {
        return this.spentAmounts;
    }

    public get receivedAmounts(): AddressAmount[] {
        return this.data.vout.map((vout: IUtxoVoutTransaction) => {
            return {
                address: vout.scriptPubKey.address,
                amount: this.toBigIntValue(vout.value),
                utxo: vout.n,
            } as AddressAmount;
        });
    }

    public get intendedReceivedAmounts(): AddressAmount[] {
        return this.receivedAmounts;
    }

    public get type(): UtxoTransactionTypeOptions {
        if (isCoinbase(this.data)) {
            return "coinbase";
        } else if (hasPrevouts(this.data)) {
            return "payment";
        } else throw MccError(`transaction ${this.txid} that does not have prevout and is not coinbase`);
    }

    public get isNativePayment(): boolean {
        // On these chains there are no other types of transactions
        return true;
    }

    public get successStatus(): TransactionSuccessStatus {
        return TransactionSuccessStatus.SUCCESS;
    }

    public paymentSummary({ inUtxo, outUtxo }: PaymentSummaryProps): PaymentSummaryResponse {
        if (this.type === "coinbase") {
            return { status: PaymentSummaryStatus.Coinbase };
        }

        // Extract source address
        let sourceAddress = undefined;
        const inputCutoff = 2 ** 16;
        if (inUtxo <= inputCutoff) {
            try {
                this.assertValidVinIndex(inUtxo);
            } catch {
                return { status: PaymentSummaryStatus.InvalidInUtxo };
            }
            const spentAmount = this.spentAmounts[Number(inUtxo)];
            if (!spentAmount.address) {
                return { status: PaymentSummaryStatus.NoSpentAmountAddress };
            }
            sourceAddress = spentAmount.address;
        } else {
            for (const vinAmount of this.spentAmounts) {
                if (vinAmount.address && unPrefix0x(standardAddressHash(vinAmount.address)) === inUtxo.toString(16)) {
                    sourceAddress = vinAmount.address;
                    break;
                }
            }
        }
        if (sourceAddress === undefined) {
            return { status: PaymentSummaryStatus.NoSpentAmountAddress };
        }

        // Extract receiving address
        let receivingAddress = undefined;
        if (outUtxo <= inputCutoff) {
            try {
                this.assertValidVoutIndex(outUtxo);
            } catch {
                return { status: PaymentSummaryStatus.InvalidOutUtxo };
            }
            const receiveAmount = this.receivedAmounts[Number(outUtxo)];
            if (!receiveAmount.address) {
                return { status: PaymentSummaryStatus.NoReceiveAmountAddress };
            }
            receivingAddress = receiveAmount.address;
        } else {
            for (const voutAmount of this.receivedAmounts) {
                if (voutAmount.address && unPrefix0x(standardAddressHash(voutAmount.address)) === outUtxo.toString(16)) {
                    receivingAddress = voutAmount.address;
                    break;
                }
            }
        }
        if (receivingAddress === undefined) {
            return { status: PaymentSummaryStatus.NoReceiveAmountAddress };
        }

        // We will update this once we iterate over inputs and outputs if we have full transaction
        let oneToOne: boolean = true;
        let numOfOutputs = 0;

        let inFunds = BigInt(0);
        let returnFunds = BigInt(0);
        let outFunds = BigInt(0);
        let inFundsOfReceivingAddress = BigInt(0);

        for (const vinAmount of this.spentAmounts) {
            if (sourceAddress && vinAmount.address === sourceAddress) {
                inFunds = inFunds + vinAmount.amount;
            }
            if (receivingAddress && vinAmount.address === receivingAddress) {
                inFundsOfReceivingAddress = inFundsOfReceivingAddress + vinAmount.amount;
            }
            if (oneToOne && vinAmount.address !== sourceAddress) {
                oneToOne = false;
            }
        }
        for (const voutAmount of this.receivedAmounts) {
            if (sourceAddress && voutAmount.address === sourceAddress) {
                returnFunds = returnFunds + voutAmount.amount;
            }
            if (receivingAddress && voutAmount.address === receivingAddress) {
                outFunds = outFunds + voutAmount.amount;
                numOfOutputs++;
            }
            // Outputs without address do not break one-to-one condition
            if (oneToOne && !voutAmount.address && voutAmount.amount >= BigInt(0)) {
                oneToOne = false;
            }
            if (oneToOne && voutAmount.address && voutAmount.address !== sourceAddress && voutAmount.address !== receivingAddress) {
                oneToOne = false;
            }
        }
        return {
            status: PaymentSummaryStatus.Success,
            response: {
                blockTimestamp: this.unixTimestamp,
                transactionHash: this.stdTxid,
                sourceAddressHash: standardAddressHash(sourceAddress),
                sourceAddressesRoot: this.sourceAddressesRoot,
                sourceAddress,
                receivingAddress,
                receivingAddressHash: standardAddressHash(receivingAddress),
                spentAmount: inFunds - returnFunds,
                receivedAmount: outFunds - inFundsOfReceivingAddress,
                transactionStatus: this.successStatus,
                paymentReference: this.stdPaymentReference,
                intendedSourceAmount: inFunds - returnFunds,
                intendedReceivingAddressHash: standardAddressHash(receivingAddress),
                intendedReceivingAddress: receivingAddress,
                intendedReceivingAmount: outFunds - inFundsOfReceivingAddress,
                oneToOne,
                toOne: numOfOutputs === 1,
            },
        };
    }

    public balanceDecreasingSummary(sourceAddressIndicator: string): BalanceDecreasingSummaryResponse {
        if (!isValidBytes32Hex(sourceAddressIndicator)) {
            return { status: BalanceDecreasingSummaryStatus.NotValidSourceAddressFormat };
        }
        const transactionType: UtxoTransactionTypeOptions = this.type;
        switch (transactionType) {
            case "coinbase": {
                return { status: BalanceDecreasingSummaryStatus.Coinbase };
            }
            case "payment": {
                let foundAddress = undefined;

                let inFunds = BigInt(0);
                let returnFunds = BigInt(0);

                for (const vinAmount of this.spentAmounts) {
                    if (
                        vinAmount.address &&
                        unPrefix0x(standardAddressHash(vinAmount.address)).toLowerCase() === unPrefix0x(sourceAddressIndicator).toLowerCase()
                    ) {
                        foundAddress = vinAmount.address;
                        inFunds = inFunds + vinAmount.amount;
                    }
                }
                for (const voutAmount of this.receivedAmounts) {
                    if (
                        voutAmount.address &&
                        unPrefix0x(standardAddressHash(voutAmount.address)).toLowerCase() === unPrefix0x(sourceAddressIndicator).toLowerCase()
                    ) {
                        returnFunds = returnFunds + voutAmount.amount;
                    }
                }
                if (foundAddress) {
                    return {
                        status: BalanceDecreasingSummaryStatus.Success,
                        response: {
                            blockTimestamp: this.unixTimestamp,
                            transactionHash: this.stdTxid,
                            sourceAddressIndicator: sourceAddressIndicator,
                            sourceAddressHash: standardAddressHash(foundAddress),
                            sourceAddress: foundAddress,
                            spentAmount: inFunds - returnFunds,
                            transactionStatus: this.successStatus,
                            paymentReference: this.stdPaymentReference,
                            isFull: true,
                        },
                    };
                } else {
                    return { status: BalanceDecreasingSummaryStatus.NoSourceAddress };
                }
            }
            default:
                // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases

                ((_: never): void => {})(transactionType);
        }

        // We didn't find the address we are looking for
        return { status: BalanceDecreasingSummaryStatus.NoSourceAddress };
    }

    public paymentNonexistenceSummary(outUtxo: number): PaymentNonexistenceSummaryResponse {
        try {
            this.assertValidVoutIndex(outUtxo);
        } catch {
            return { status: PaymentNonexistenceSummaryStatus.InvalidOutUtxo };
        }

        if (this.type === "coinbase") {
            return { status: PaymentNonexistenceSummaryStatus.Coinbase };
        }

        const receiveAmount = this.receivedAmounts[outUtxo];
        if (!receiveAmount.address) {
            return { status: PaymentNonexistenceSummaryStatus.NoReceiveAmountAddress };
        }

        // Extract addresses from input and output fields
        const receivingAddress = receiveAmount.address;

        let outFunds = BigInt(0);
        let inFundsOfReceivingAddress = BigInt(0);
        let nuOfOuts = 0;

        for (const vinAmount of this.spentAmounts) {
            if (vinAmount.address === receivingAddress) {
                inFundsOfReceivingAddress += vinAmount.amount;
            }
        }
        for (const voutAmount of this.receivedAmounts) {
            if (voutAmount.address === receivingAddress) {
                outFunds += voutAmount.amount;
                nuOfOuts++;
            }
        }
        return {
            status: PaymentNonexistenceSummaryStatus.Success,
            response: {
                blockTimestamp: this.unixTimestamp,
                transactionHash: this.stdTxid,
                receivingAddress,
                receivingAddressHash: standardAddressHash(receivingAddress),
                sourceAddressesRoot: this.sourceAddressesRoot,
                receivedAmount: outFunds - inFundsOfReceivingAddress,
                transactionStatus: this.successStatus,
                paymentReference: this.stdPaymentReference,
                intendedReceivingAddressHash: standardAddressHash(receivingAddress),
                intendedReceivingAddress: receivingAddress,
                intendedReceivingAmount: outFunds - inFundsOfReceivingAddress,
                toOne: nuOfOuts === 1,
            },
        };
    }
    ///////////////////////////////
    //// Utxo specific methods ////
    ///////////////////////////////

    /**
     * Asserts whether the vin index is in valid range. If not, exception is thrown.
     * @param vinIndex vin index
     */
    assertValidVinIndex(vinIndex: number | bigint) {
        if (vinIndex < 0 || vinIndex >= this.sourceAddresses.length) {
            throw new mccError(mccErrorCode.InvalidParameter, Error("Invalid vin index"));
        }
    }

    /**
     * Asserts whether the vout index is in valid range. If not, exception is thrown.
     * @param voutIndex vout index
     */
    assertValidVoutIndex(voutIndex: number | bigint) {
        if (voutIndex < 0 || voutIndex >= this.receivingAddresses.length) {
            throw new mccError(mccErrorCode.InvalidParameter, Error("Invalid vout index"));
        }
    }
}
