import BN from "bn.js";
import { MCC } from "../..";
import { TransactionSuccessStatus } from "../../types";
import { AlgoTransactionTypeOptions, IAlgoGetTransactionRes, IAlgoIndexerAdditionalData } from "../../types/algoTypes";
import { base64ToHex, txIdToHexNo0x } from "../../utils/algoUtils";
import { ALGO_MDU, ALGO_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { ZERO_BYTES_32, isValidBytes32Hex, prefix0x, toBN } from "../../utils/utils";
import {
   AddressAmount,
   BalanceDecreasingProps,
   BalanceDecreasingSummaryResponse,
   PaymentSummaryProps,
   PaymentSummaryResponse,
   TransactionBase,
} from "../TransactionBase";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require("web3");

export class AlgoIndexerTransaction extends TransactionBase {
   protected get data(): IAlgoGetTransactionRes {
      return this.privateData as IAlgoGetTransactionRes;
   }

   protected get additionalData(): IAlgoIndexerAdditionalData | undefined {
      return this.privateAdditionalData as IAlgoIndexerAdditionalData | undefined;
   }

   protected set additionalData(data: IAlgoIndexerAdditionalData | undefined) {
      this.privateAdditionalData = data;
   }

   public get intendedSpentAmounts(): AddressAmount[] {
      throw new Error("Method not implemented.");
   }
   public get intendedReceivedAmounts(): AddressAmount[] {
      throw new Error("Method not implemented.");
   }
   public async makeFull(client: MCC.ALGO): Promise<void> {
      if (!this.additionalData) {
         this.additionalData = {};
      }
      if (!this.additionalData.assetInfo) {
         if (this.data.transaction.assetTransferTransaction) {
            this.additionalData.assetInfo = await client.getIndexerAssetInfo(this.data.transaction.assetTransferTransaction.assetId);
         }
      }
   }

   public get txid(): string {
      return this.hash;
   }

   public get stdTxid(): string {
      return txIdToHexNo0x(this.txid);
   }

   public get hash(): string {
      if (this.data.transaction.id === undefined) {
         return "";
      }
      return this.data.transaction.id;
   }

   public get reference(): string[] {
      if (this.data.transaction.note) {
         return [base64ToHex(this.data.transaction.note)];
      }
      return [];
   }

   public get stdPaymentReference(): string {
      let paymentReference = this.reference.length === 1 ? prefix0x(this.reference[0]) : "";
      try {
         // try to parse out
         paymentReference = prefix0x(web3.utils.hexToString(prefix0x(paymentReference)));
      } catch (e) {
         return ZERO_BYTES_32;
      }
      if (!isValidBytes32Hex(paymentReference)) {
         paymentReference = ZERO_BYTES_32;
      }
      return paymentReference;
   }

   public get unixTimestamp(): number {
      if (this.data.transaction.roundTime === undefined) {
         return 0;
      }
      return this.data.transaction.roundTime;
   }

   public get sourceAddresses(): string[] {
      return [this.data.transaction.sender];
   }

   public get assetSourceAddresses(): (string | undefined)[] {
      if (this.type === "axfer" || this.type === "axfer_close") {
         // for token transfers send by clawback transaction (https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-clawback-transaction)
         // and asset transfer transactions (https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-transfer-transaction)
         if (this.data.transaction.assetTransferTransaction.sender) {
            // for asset clawback tx it somehow gets addess w/out checksum
            return [this.data.transaction.assetTransferTransaction.sender];
         }
         // Other kinds of asset transactions (axfer and axfer_close ) use snd field as sender
         return [this.data.transaction.sender];
      }
      // Other kinds of transactions have nothing to do with assets
      return [];
   }
   // TODO close address
   public get receivingAddresses(): string[] {
      if (this.type === "pay" && this.data.transaction.paymentTransaction) {
         return [this.data.transaction.paymentTransaction.receiver];
      }
      // TODO check other transaction types
      return [];
   }

   // TODO what if revicer=closeTo
   public get assetReceivingAddresses(): (string | undefined)[] {
      const recAddresses = [];
      if (this.type === "axfer" || this.type === "axfer_close") {
         if (this.data.transaction.assetTransferTransaction.receiver) {
            recAddresses.push(this.data.transaction.assetTransferTransaction.receiver);
         }
         if (this.data.transaction.assetTransferTransaction.closeTo) {
            recAddresses.push(this.data.transaction.assetTransferTransaction.closeTo);
         }
         return recAddresses;
      }
      return [];
   }

   public get fee(): BN {
      return toBN(this.data.transaction.fee);
   }

   public get feeSignerTotalAmount(): AddressAmount {
      throw new Error("Method not implemented.");
   }

   public get spentAmounts(): AddressAmount[] {
      if (this.data.transaction.txType === "pay" && this.data.transaction.paymentTransaction) {
         return [
            {
               address: this.sourceAddresses[0],
               amount: this.fee.add(toBN(this.data.transaction.paymentTransaction.amount)),
            },
         ];
      } else {
         return [
            {
               address: this.sourceAddresses[0],
               amount: this.fee,
            },
         ];
      }
   }

   public get assetSpentAmounts(): AddressAmount[] {
      // for transactions of type axfer
      if (this.type === "axfer") {
         if (this.data.transaction.assetTransferTransaction) {
            let preamount = this.data.transaction.assetTransferTransaction.amount;
            if (this.data.transaction.assetTransferTransaction.closeAmount) {
               preamount += this.data.transaction.assetTransferTransaction.closeAmount;
            }
            const amount = preamount.toString();
            if (!(this.additionalData && this.additionalData.assetInfo)) {
               throw new mccError(mccErrorCode.InvalidResponse, Error("call the makeFull before to make sure additional data full"));
            }
            let decimals = this.additionalData.assetInfo.params.decimals;
            if (typeof decimals === "bigint") {
               decimals = Number(decimals);
            }
            return [
               {
                  address: this.assetSourceAddresses[0],
                  amount: toBN(amount),
                  elementaryUnits: web3.utils.toBN(Math.pow(10, decimals)),
               },
            ];
         }
      }
      return [];
      // For now we don't support spending / using non-native tokens
   }

   // TODO close amount
   // TODO what if receiver=closeTo
   public get receivedAmounts(): AddressAmount[] {
      if (this.type === "pay" && this.data.transaction.paymentTransaction) {
         return [
            {
               address: this.receivingAddresses[0],
               amount: toBN(this.data.transaction.paymentTransaction.amount),
            },
         ];
      }
      return [];
   }
   // TODO what if receiver=closeTo
   public get assetReceivedAmounts(): AddressAmount[] {
      const asRecAm: AddressAmount[] = [];
      if (this.type === "axfer") {
         if (this.data.transaction.assetTransferTransaction) {
            const amount = this.data.transaction.assetTransferTransaction.amount.toString();
            if (!(this.additionalData && this.additionalData.assetInfo)) {
               throw new mccError(mccErrorCode.InvalidResponse, Error("call the makeFull before to make sure additional data is full"));
            }
            let decimals = this.additionalData.assetInfo.params.decimals;
            if (typeof decimals === "bigint") {
               decimals = Number(decimals);
            }
            asRecAm.push({
               address: this.data.transaction.assetTransferTransaction.receiver,
               amount: toBN(amount),
               elementaryUnits: web3.utils.toBN(Math.pow(10, decimals)),
            });
            if (this.data.transaction.assetTransferTransaction.closeTo) {
               const clAmount = this.data.transaction.assetTransferTransaction.closeAmount.toString();
               asRecAm.push({
                  address: this.data.transaction.assetTransferTransaction.closeTo,
                  amount: toBN(clAmount),
                  elementaryUnits: web3.utils.toBN(Math.pow(10, decimals)),
               });
            }
            return asRecAm;
         }
      }
      return [];
   }

   public get type(): AlgoTransactionTypeOptions {
      return this.data.transaction.txType;
   }

   public get isNativePayment(): boolean {
      return this.type === "pay";
   }

   public get currencyName(): string {
      if (this.type === "pay") {
         return ALGO_NATIVE_TOKEN_NAME;
      } else if (this.type === "axfer" && this.data.transaction.assetTransferTransaction) {
         return this.data.transaction.assetTransferTransaction.assetId.toString();
      }
      return "";
   }

   public get elementaryUnits(): BN {
      return toBN(ALGO_MDU);
   }

   public get successStatus(): TransactionSuccessStatus {
      // TODO research this further
      return TransactionSuccessStatus.SUCCESS;
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   public async paymentSummary(props: PaymentSummaryProps): Promise<PaymentSummaryResponse> {
      throw new Error("Method not implemented.");
      // if (!this.isNativePayment) {
      //    return { isNativePayment: false };
      // }
      // return {
      //    isNativePayment: true,
      //    sourceAddress: this.sourceAddresses[0],
      //    receivingAddress: this.receivingAddresses[0],
      //    spentAmount: this.spentAmounts[0].amount,
      //    receivedAmount: this.receivedAmounts[0].amount,
      //    paymentReference: this.stdPaymentReference,
      //    oneToOne: true,
      //    isFull: true,
      // };
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   public balanceDecreasingSummary(props: BalanceDecreasingProps): Promise<BalanceDecreasingSummaryResponse> {
      throw new Error("Method not implemented.");
   }
}
