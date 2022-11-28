import BN from "bn.js";
import { Payment, TransactionMetadata } from "xrpl";
import { IssuedCurrencyAmount, Memo } from "xrpl/dist/npm/models/common";
import { MccClient, TransactionSuccessStatus } from "../../types";
import { IXrpGetTransactionRes } from "../../types/xrpTypes";
import { XRP_MDU, XRP_NATIVE_TOKEN_NAME, XRP_UTD } from "../../utils/constants";
import { Managed } from "../../utils/managed";
import { bytesAsHexToString, isValidBytes32Hex, prefix0x, toBN, ZERO_BYTES_32 } from "../../utils/utils";
import { AddressAmount, PaymentSummary, TransactionBase } from "../TransactionBase";

@Managed()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      return [this.data.result.Account];
   }

   public get assetSourceAddresses(): (string | undefined)[] {
      throw new Error("Method not implemented.");
   }

   public get receivingAddresses(): string[] {
      if (this.data.result.TransactionType == "Payment") {
         const payment = this.data.result as Payment;
         return [payment.Destination];
      }
      // TODO: Check if in other types of payments one has something similar to Destination
      return [];
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

   public get spentAmounts(): AddressAmount[] {
      if (this.isNativePayment) {
         const payment = this.data.result as Payment;
         return [
            {
               address: this.sourceAddresses[0],
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               amount: toBN(payment.Amount as any).add(this.fee),
            },
         ];
      }
      if (this.type === "Payment") {
         // Token transfer
         return [
            {
               address: this.sourceAddresses[0],
               amount: this.fee,
            },
         ];
      }
      // TODO Check for other non-native payment types
      // TODO: Check whether in some other non-payment cases spent amount is different
      return [
         {
            address: this.sourceAddresses[0],
            amount: toBN(this.fee),
         },
      ];
   }

   public get assetSpentAmounts(): AddressAmount[] {
      throw new Error("Method not implemented.");
   }

   public get receivedAmounts(): AddressAmount[] {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metaData: TransactionMetadata = this.data.result.meta || (this.data.result as any).metaData;
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

   public get assetReceivedAmounts(): AddressAmount[] {
      throw new Error("Method not implemented.");
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
      // https://xrpl.org/transaction-results.html
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metaData: TransactionMetadata = this.data.result.meta || (this.data.result as any).metaData;
      const result = metaData.TransactionResult;
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

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   public async paymentSummary(client: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean): Promise<PaymentSummary> {
      if (!this.isNativePayment) {
         if (this.type === "Payment") {
            // token transfer
            const value = ((this.data.result as Payment).Amount as IssuedCurrencyAmount).value;
            const valueSplit = value.split(".");
            let eleUnits = 1;
            if (valueSplit.length === 2) {
               eleUnits = Math.pow(10, valueSplit[1].length);
            }
            return {
               isNativePayment: false,
               isTokenTransfer: true,
               tokenElementaryUnits: toBN(eleUnits),
               receivedTokenAmount: toBN(valueSplit.join("")),
               sourceAddress: this.sourceAddresses[0],
               receivingAddress: this.receivingAddresses[0],
               spentAmount: this.spentAmounts[0].amount, // We still spend fee
               paymentReference: this.stdPaymentReference,
               tokenName: this.currencyName,
               oneToOne: true,
               isFull: true,
            };
         } else {
            return { isNativePayment: false };
         }
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

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   public async makeFull(client: MccClient): Promise<void> {
      return;
   }

   //////////////////////////////
   //// Xrp specific methods ////
   //////////////////////////////

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
