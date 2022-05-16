import BN from "bn.js";
import { Payment, TransactionMetadata } from "xrpl";
import { Memo } from "xrpl/dist/npm/models/common";
import { MccClient, TransactionSuccessStatus } from "../../types";
import { IXrpGetTransactionRes } from "../../types/xrpTypes";
import { XRP_MDU, XRP_NATIVE_TOKEN_NAME, XRP_UTD } from "../../utils/constants";
import { isValidBytes32Hex, prefix0x, toBN, ZERO_BYTES_32 } from "../../utils/utils";
import { AddressAmount, PaymentSummary, TransactionBase } from "../TransactionBase";

export class XrpTransaction extends TransactionBase<IXrpGetTransactionRes, any> {
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
         return this.data.result.Memos.map((memoobj: Memo) => {
            return memoobj.Memo.MemoData || "";
         });
      }
      return [];
   }

   public get stdPaymentReference(): string {
      let paymentReference = this.reference.length === 1 ? prefix0x(this.reference[0]) : "";
      if (!isValidBytes32Hex(paymentReference)) {
         paymentReference = ZERO_BYTES_32;
      }
      return paymentReference;
   }

   public get unixTimestamp(): number {
      return (
         XRP_UTD +
         // @ts-ignore
         this.data.result.date
      );
   }

   public get sourceAddresses(): string[] {
      return [this.data.result.Account];
   }

   public get receivingAddresses(): string[] {
      if (this.data.result.TransactionType == "Payment") {
         let payment = this.data.result as Payment;
         return [payment.Destination];
      }
      // TODO: Check if in other types of payments one has something similar to Destination
      return [];
   }

   public get fee(): BN {
      if (!this.data.result.Fee) {
         return toBN(0);
      }
      return toBN(this.data.result.Fee);
   }

   public get spentAmounts(): AddressAmount[] {
      if (this.isNativePayment) {
         let payment = this.data.result as Payment;
         return [
            {
               address: this.sourceAddresses[0],
               amount: toBN(payment.Amount as any).add(this.fee),
            },
         ];
      }
      // TODO Check for other non-native payment types
      // TODO: Check whether in some other non-payment cases spent amount is different
      return [
         {
            amount: toBN(this.fee),
         },
      ];
   }

   public get receivedAmounts(): AddressAmount[] {
      let metaData: TransactionMetadata = this.data.result.meta || (this.data.result as any).metaData;
      if (this.isNativePayment) {
         return [
            {
               address: this.receivingAddresses[0],
               amount: toBN(metaData.delivered_amount as string),
            },
         ];
      }
      return [];
   }

   public get type(): string {
      return this.data.result.TransactionType;
      // Possible types available at Transaction object in xrpl lib
   }

   public get isNativePayment(): boolean {
      return this.currencyName === XRP_NATIVE_TOKEN_NAME;
   }

   public get currencyName(): string {
      // With ripple this is currency code
      if (this.type === "Payment") {
         // @ts-ignore
         if (this.data.result.Amount.currency) {
            // @ts-ignore
            return this.data.result.Amount.currency;
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
      // https://xrpl.org/transaction-results.html
      let metaData: TransactionMetadata = this.data.result.meta || (this.data.result as any).metaData;
      let result = metaData.TransactionResult;
      if (result === "tesSUCCESS") {
         // https://xrpl.org/tes-success.html
         return TransactionSuccessStatus.SUCCESS;
      }
      if (result.startsWith("tec")) {
         // https://xrpl.org/tec-codes.html
         switch (result) {
            case "tecDST_TAG_NEEDED":
            case "tecNO_DST":
            case "tecNO_DST_INSUF_XRP":
            case "tecNO_PERMISSION":
               return TransactionSuccessStatus.RECEIVER_FAILURE;
            default:
               return TransactionSuccessStatus.SENDER_FAILURE;
         }
      }
      // Other codes: tef, tel, tem, ter are not applied to ledgers
      return TransactionSuccessStatus.SENDER_FAILURE;
   }

   public async paymentSummary(client: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean): Promise<PaymentSummary> {
      if (!this.isNativePayment) {
         return { isNativePayment: false };
      }
      return {
         isNativePayment: true,
         sourceAddress: this.sourceAddresses[0],
         receivingAddress: this.receivingAddresses[0],
         spentAmount: this.spentAmounts[0].amount,
         // TODO: Check if intended sent value can be set
         receivedAmount: this.successStatus === TransactionSuccessStatus.SUCCESS ? this.receivedAmounts[0].amount : toBN(0),
         oneToOne: true,
         paymentReference: this.stdPaymentReference,
         isFull: true,
      };
   }
}
