import BN from "bn.js";
import { AccountDelete, Payment, TransactionMetadata } from "xrpl";
import { IssuedCurrencyAmount, Memo } from "xrpl/dist/npm/models/common";
import { MccClient, TransactionSuccessStatus } from "../../types";
import { IXrpGetTransactionRes, XrpTransactionTypeUnion } from "../../types/xrpTypes";
import { XRP_MDU, XRP_NATIVE_TOKEN_NAME, XRP_UTD } from "../../utils/constants";
import { Managed } from "../../utils/managed";
import { ZERO_BYTES_32, bytesAsHexToString, isValidBytes32Hex, prefix0x, toBN } from "../../utils/utils";
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
      switch (this.type) {
         case "Payment":
         case "NFTokenAcceptOffer":
         case "NFTokenBurn":
         case "NFTokenCancelOffer":
         case "NFTokenCreateOffer":
         case "NFTokenMint":
         case "AccountDelete":
         case "AccountSet":
         case "CheckCancel":
         case "CheckCash":
         case "CheckCreate":
         case "DepositPreauth":
         case "EscrowCancel":
         case "EscrowCreate":
         case "EscrowFinish":
         case "OfferCancel":
         case "OfferCreate":
         case "PaymentChannelClaim":
         case "PaymentChannelCreate":
         case "PaymentChannelFund":
         case "SetRegularKey":
         case "SignerListSet":
         case "TicketCreate":
         case "TrustSet":
            return [this.data.result.Account];
         default:
            // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
            // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
            ((_: never): void => {})(this.type);
      }
      // TODO: Check if in other types of payments one has something similar to Destination
      throw new Error("Exhaustive switch guard: Cannot happen");
   }

   public get assetSourceAddresses(): (string | undefined)[] {
      throw new Error("Method not implemented.");
   }

   public get receivingAddresses(): string[] {
      switch (this.type) {
         case "Payment": {
            const payment = this.data.result as Payment;
            return [payment.Destination];
         }
         case "AccountDelete":
            if (!this.data.result.meta || typeof this.data.result.meta === "string" || !this.data.result.meta.DeliveredAmount) {
               return [];
            } else {
               if (typeof this.data.result.meta.DeliveredAmount === "string") {
                  const accountDelete = this.data.result as AccountDelete;
                  return [accountDelete.Destination];
               } else {
                  // Token transfer recieved by account deletion
                  return [];
               }
            }
         case "NFTokenAcceptOffer":
         case "NFTokenBurn":
         case "NFTokenCancelOffer":
         case "NFTokenCreateOffer":
         case "NFTokenMint":
         case "AccountSet":
         case "CheckCancel":
         case "CheckCash":
         case "CheckCreate":
         case "DepositPreauth":
         case "EscrowCancel":
         case "EscrowCreate":
         case "EscrowFinish":
         case "OfferCancel":
         case "OfferCreate":
         case "PaymentChannelClaim":
         case "PaymentChannelCreate":
         case "PaymentChannelFund":
         case "SetRegularKey":
         case "SignerListSet":
         case "TicketCreate":
         case "TrustSet":
            return [];
         default:
            // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
            // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
            ((_: never): void => {})(this.type);
      }
      // TODO: Check if in other types of payments one has something similar to Destination
      throw new Error("Exhaustive switch guard: Cannot happen");
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
      switch (this.type) {
         case "Payment": {
            const payment = this.data.result as Payment;
            if (this.isNativePayment) {
               if (typeof payment.Amount === "string") {
                  return [
                     {
                        address: this.sourceAddresses[0],
                        amount: toBN(payment.Amount).add(this.fee),
                     },
                  ];
               } else {
                  throw new Error("Native payment classification error: Cannot happen");
               }
            } else {
               // Token transfer
               return [
                  {
                     address: this.sourceAddresses[0],
                     amount: this.fee,
                  },
               ];
            }
         }
         case "AccountDelete":
            if (!this.data.result.meta || typeof this.data.result.meta === "string" || !this.data.result.meta.DeliveredAmount) {
               return [{ address: this.sourceAddresses[0], amount: toBN(this.fee) }];
            } else {
               if (typeof this.data.result.meta.DeliveredAmount === "string") {
                  return [{ address: this.sourceAddresses[0], amount: toBN(this.fee).add(toBN(this.data.result.meta.DeliveredAmount)) }];
               } else {
                  // Token transfer delivered by account deletion
                  return [{ address: this.sourceAddresses[0], amount: toBN(this.fee) }];
               }
            }
         case "NFTokenAcceptOffer":
         case "NFTokenBurn":
         case "NFTokenCancelOffer":
         case "NFTokenCreateOffer":
         case "NFTokenMint":
         case "AccountSet":
         case "CheckCancel":
         case "CheckCash":
         case "CheckCreate":
         case "DepositPreauth":
         case "EscrowCancel":
         case "EscrowCreate":
         case "EscrowFinish":
         case "OfferCancel":
         case "OfferCreate":
         case "PaymentChannelClaim":
         case "PaymentChannelCreate":
         case "PaymentChannelFund":
         case "SetRegularKey":
         case "SignerListSet":
         case "TicketCreate":
         case "TrustSet":
            return [
               {
                  address: this.sourceAddresses[0],
                  amount: toBN(this.fee),
               },
            ];
         default:
            // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
            // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
            ((_: never): void => {})(this.type);
      }
      throw new Error("Exhaustive switch guard: Cannot happen");
   }

   public get assetSpentAmounts(): AddressAmount[] {
      throw new Error("Method not implemented.");
   }

   public get receivedAmounts(): AddressAmount[] {
      switch (this.type) {
         case "Payment": {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const metaData: TransactionMetadata = this.data.result.meta || (this.data.result as any).metaData;
            if (this.isNativePayment) {
               return [
                  {
                     address: this.receivingAddresses[0],
                     amount: toBN(metaData.delivered_amount as string),
                  },
               ];
            } else {
               return [];
            }
         }
         case "AccountDelete":
            if (!this.data.result.meta || typeof this.data.result.meta === "string" || !this.data.result.meta.DeliveredAmount) {
               return [];
            } else {
               if (typeof this.data.result.meta.DeliveredAmount === "string") {
                  const accountDelete = this.data.result as AccountDelete;
                  return [{ address: accountDelete.Destination, amount: toBN(this.data.result.meta.DeliveredAmount) }];
               } else {
                  // Token transfer recieved by account deletion
                  return [];
               }
            }
         case "NFTokenAcceptOffer":
         case "NFTokenBurn":
         case "NFTokenCancelOffer":
         case "NFTokenCreateOffer":
         case "NFTokenMint":
         case "AccountSet":
         case "CheckCancel":
         case "CheckCash":
         case "CheckCreate":
         case "DepositPreauth":
         case "EscrowCancel":
         case "EscrowCreate":
         case "EscrowFinish":
         case "OfferCancel":
         case "OfferCreate":
         case "PaymentChannelClaim":
         case "PaymentChannelCreate":
         case "PaymentChannelFund":
         case "SetRegularKey":
         case "SignerListSet":
         case "TicketCreate":
         case "TrustSet":
            return [];
         default:
            // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
            // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
            ((_: never): void => {})(this.type);
      }
      throw new Error("Exhaustive switch guard: Cannot happen");
   }

   public get assetReceivedAmounts(): AddressAmount[] {
      throw new Error("Method not implemented.");
   }

   public get type(): XrpTransactionTypeUnion {
      return this.data.result.TransactionType;
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
