import { MccUtxoClient } from "../../module";
import { DOGE_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { standardAddressHash, toBN } from "../../utils/utils";
import { PaymentSummaryProps, PaymentSummaryResponse, PaymentSummaryStatus } from "../TransactionBase";
import { DogeAddress } from "../addressObjects/DogeAddress";
import { UtxoTransaction } from "./UtxoTransaction";

export class DogeTransaction extends UtxoTransaction {
    public isValidPkscript(index: number): boolean {
        const vout = this.extractVoutAt(index);
        if (!vout.scriptPubKey.address) return true; //OP_RETURN
        const address = new DogeAddress(vout.scriptPubKey.address);
        return address.addressToPkscript() == vout.scriptPubKey.hex;
    }

    public get currencyName(): string {
        return DOGE_NATIVE_TOKEN_NAME;
    }

    public async paymentSummary({ client, inUtxo, outUtxo }: PaymentSummaryProps): Promise<PaymentSummaryResponse> {
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

        // TODO: update
        await this.vinVoutAt(inUtxo, client as MccUtxoClient);

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
}
