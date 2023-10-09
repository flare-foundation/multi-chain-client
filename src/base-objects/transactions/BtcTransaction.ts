import BN from "bn.js";
import { BTC_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { isValidBytes32Hex, standardAddressHash, toBN } from "../../utils/utils";
import {
    AddressAmount,
    BalanceDecreasingProps,
    BalanceDecreasingSummaryResponse,
    BalanceDecreasingSummaryStatus,
    PaymentSummaryProps,
    PaymentSummaryResponse,
    PaymentSummaryStatus,
    TransactionGetterFunction,
} from "../TransactionBase";
import { UtxoTransaction, UtxoTransactionTypeOptions } from "./UtxoTransaction";

export class BtcTransaction extends UtxoTransaction<BtcTransaction> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async makeFull<BtcTransaction>(transactionGetter: TransactionGetterFunction<BtcTransaction>): Promise<void> {
        // Not needed with verbosity 2
        // throw new Error("Not needed with verbosity 2");
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return;
    }
    // Btc specific transaction

    public get currencyName(): string {
        return BTC_NATIVE_TOKEN_NAME;
    }

    public get sourceAddresses(): (string | undefined)[] {
        if (this.type === "coinbase") {
            // Coinbase transactions mint coins
            return [undefined];
        }

        // Regular transactions
        return this.data.vin.map((vin) => {
            if (vin.prevout) {
                return vin.prevout.scriptPubKey.address;
            } else {
                // TODO: we don't have info about the source addresses of this transaction, return undefined for now
                // TODO: we can extract them from additional data (old way)
                return undefined;
            }
        });
    }

    public get fee(): BN {
        const error = new mccError(
            mccErrorCode.InvalidResponse,
            Error("fee can't be calculated, the transaction data does not contain the prevouts field (verbosity 2)")
        );
        if (this.type === "coinbase") {
            // Coinbase transactions mint coins
            return toBN(0);
        }
        let inSum = toBN(0);
        if (this.hasPrevouts) {
            inSum = this.data.vin.reduce(this.reducerFunctionPrevouts, toBN(0));
        } else {
            throw error;
        }
        const outSum = this.data.vout.reduce(this.reducerFunctionVouts, toBN(0));
        return inSum.sub(outSum);
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

        if (this.hasPrevouts) {
            return this.data.vin.map((vin) => {
                const address = vin.prevout && vin.prevout.scriptPubKey.address ? vin.prevout.scriptPubKey.address : undefined;
                const value = this.toBnValue(vin?.prevout?.value || 0);
                const addressAmount = {
                    address: address,
                    amount: value,
                    utxo: vin?.vout || 0,
                } as AddressAmount;
                return addressAmount;
            });
        } else {
            const error = new mccError(
                mccErrorCode.InvalidResponse,
                Error("Spent amounts can't be calculated, the transaction data does not contain the prevouts field (verbosity 2)")
            );
            throw error;
        }
    }

    public get type(): UtxoTransactionTypeOptions {
        if (this.data.vin.length === 0 || this.data.vin[0].coinbase) {
            return "coinbase";
        }
        if (this.hasPrevouts) return "full_payment";
        return "partial_payment";
    }

    // BTC transaction specific helper methods

    get hasPrevouts(): boolean {
        return this.data.vin.every((vin) => {
            return vin.prevout !== undefined || vin.coinbase !== undefined;
        });
    }

    public async paymentSummary<BtcTransaction>({ inUtxo, outUtxo }: PaymentSummaryProps<BtcTransaction>): Promise<PaymentSummaryResponse> {
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
                status: PaymentSummaryStatus.Success,
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

    public async balanceDecreasingSummary<BtcTransaction>({
        sourceAddressIndicator,
    }: BalanceDecreasingProps<BtcTransaction>): Promise<BalanceDecreasingSummaryResponse> {
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
            case "full_payment": {
                const spentAmounts = this.spentAmounts;
                const spentAmount = spentAmounts[vinIndex];
                const sourceAddress = spentAmount.address;
                if (sourceAddress) {
                    let inFunds = toBN(0);
                    let returnFunds = toBN(0);

                    for (const vinAmount of this.spentAmounts) {
                        if (sourceAddress && vinAmount.address === sourceAddress) {
                            inFunds = inFunds.add(vinAmount.amount);
                        }
                    }
                    for (const voutAmount of this.receivedAmounts) {
                        if (sourceAddress && voutAmount.address === sourceAddress) {
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
            case "partial_payment":
                return { status: BalanceDecreasingSummaryStatus.InvalidTransactionDataObject };

            default:
                // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
                // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
                ((_: never): void => {})(transactionType);
        }

        // We didn't find the address we are looking for
        return { status: BalanceDecreasingSummaryStatus.NoSourceAddress };
    }
}
