import BN from "bn.js";
import { Payment, TransactionMetadata } from "xrpl";
import { IssuedCurrencyAmount, Memo } from "xrpl/dist/npm/models/common";
import { isCreatedNode, isDeletedNode, isModifiedNode } from "xrpl/dist/npm/models/transactions/metadata";
import { MccClient, TransactionSuccessStatus } from "../../types";
import { IXrpGetTransactionRes, XrpTransactionStatusPrefixes, XrpTransactionTypeUnion } from "../../types/xrpTypes";
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
         return this.data.result.Memos.map((memoObj: Memo) => {
            return memoObj.Memo.MemoData || "";
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
      const sourceAddresses: string[] = [];
      for (const addAmm of this.spentAmounts) {
         if (addAmm.address) {
            sourceAddresses.push(addAmm.address);
         }
      }
      return sourceAddresses;
   }

   public get assetSourceAddresses(): (string | undefined)[] {
      throw new Error("Method not implemented.");
   }

   public get receivingAddresses(): string[] {
      const receivingAddresses: string[] = [];
      for (const addAmm of this.receivedAmounts) {
         if (addAmm.address) {
            receivingAddresses.push(addAmm.address);
         }
      }
      return receivingAddresses;
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
      if (typeof this.data.result.meta === "string" || !this.data.result.meta) {
         throw new Error("Transaction meta is not available thus spent amounts cannot be calculated");
      }
      const spendAmounts: AddressAmount[] = [];
      for (const node of this.data.result.meta.AffectedNodes) {
         if (isModifiedNode(node)) {
            if (
               node.ModifiedNode.LedgerEntryType === "AccountRoot" &&
               node.ModifiedNode.FinalFields &&
               node.ModifiedNode.PreviousFields &&
               node.ModifiedNode.FinalFields.Account &&
               node.ModifiedNode.FinalFields.Balance &&
               node.ModifiedNode.PreviousFields.Balance
            ) {
               // TODO: this is due to xrpl.js lib mistakes
               const diff = toBN(node.ModifiedNode.FinalFields.Balance as string).sub(toBN(node.ModifiedNode.PreviousFields.Balance as string));
               if (diff.lt(toBN(0))) {
                  spendAmounts.push({
                     address: node.ModifiedNode.FinalFields.Account as string,
                     amount: diff.neg(),
                  });
               }
            }
         }
         if (isCreatedNode(node)) {
            // TODO: check if true
            // Created node can't affect spend amounts
         }
         if (isDeletedNode(node)) {
            if (node.DeletedNode.LedgerEntryType === "AccountRoot" && "PreviousFields" in node.DeletedNode) {
               if (node.DeletedNode.FinalFields && node.DeletedNode.FinalFields.Account) {
                  if (node.DeletedNode.FinalFields.Balance) {
                     // TODO: this is due to xrpl.js lib mistakes
                     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                     const diff = toBN(node.DeletedNode.FinalFields.Balance as string).sub(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        toBN(((node.DeletedNode as any).PreviousFields as any).Balance as string)
                     );
                     if (diff.lt(toBN(0))) {
                        spendAmounts.push({
                           address: node.DeletedNode.FinalFields.Account as string,
                           amount: diff.neg(),
                        });
                     }
                  } else {
                     // TODO: this is due to xrpl.js lib mistakes
                     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
                     const diff = toBN(((node.DeletedNode as any).PreviousFields as any).Balance as string);
                     if (diff.gt(toBN(0))) {
                        spendAmounts.push({
                           address: node.DeletedNode.FinalFields.Account as string,
                           amount: diff,
                        });
                     }
                  }
               }
            }
         }
      }
      // Check if signer is already in source amounts
      const feeSigner = this.data.result.Account;
      for (const spendAmount of spendAmounts) {
         if (spendAmount.address === feeSigner) {
            return spendAmounts;
         }
      }
      // Check if singer got positive amount
      const receivedAmounts = this.receivedAmounts;
      for (const receivedAmount of receivedAmounts) {
         if (receivedAmount.address === feeSigner) {
            const { amount, ...rest } = receivedAmount;
            spendAmounts.push({
               amount: amount.neg(),
               ...rest,
            });
            return spendAmounts;
         }
      }
      // You cash a check for exactly fee amount
      spendAmounts.push({
         amount: toBN(0),
         address: feeSigner,
      });
      return spendAmounts;
   }

   public get assetSpentAmounts(): AddressAmount[] {
      throw new Error("Method not implemented.");
   }

   public get receivedAmounts(): AddressAmount[] {
      if (typeof this.data.result.meta === "string" || !this.data.result.meta) {
         throw new Error("Transaction meta is not available thus received amounts cannot be calculated");
      }
      const receivedAmounts: AddressAmount[] = [];
      for (const node of this.data.result.meta.AffectedNodes) {
         if (isModifiedNode(node)) {
            if (
               node.ModifiedNode.LedgerEntryType === "AccountRoot" &&
               node.ModifiedNode.FinalFields &&
               node.ModifiedNode.PreviousFields &&
               node.ModifiedNode.FinalFields.Account &&
               node.ModifiedNode.FinalFields.Balance &&
               node.ModifiedNode.PreviousFields.Balance
            ) {
               // TODO: this is due to xrpl.js lib mistakes
               const diff = toBN(node.ModifiedNode.FinalFields.Balance as string).sub(toBN(node.ModifiedNode.PreviousFields.Balance as string));
               if (diff.gt(toBN(0))) {
                  receivedAmounts.push({
                     address: node.ModifiedNode.FinalFields.Account as string,
                     amount: diff,
                  });
               }
            }
         } else if (isCreatedNode(node)) {
            if (node.CreatedNode.LedgerEntryType === "AccountRoot" && node.CreatedNode.NewFields && node.CreatedNode.NewFields.Account) {
               if (node.CreatedNode.NewFields.Balance) {
                  receivedAmounts.push({
                     address: node.CreatedNode.NewFields.Account as string,
                     amount: toBN(node.CreatedNode.NewFields.Balance as string),
                  });
               }
            }
         } else if (isDeletedNode(node)) {
            // TODO: check if true
            // Created node can't affect spend amounts
         }
      }
      return receivedAmounts;
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

   //!!! issuer is sometimes important !!!
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
      if (typeof this.data.result.meta === "string" || !this.data.result.meta) {
         throw new Error("Transaction meta is not available thus transaction status cannot be extracted");
      }
      const result = this.data.result.meta.TransactionResult;
      const prefix = result.slice(0, 3) as XrpTransactionStatusPrefixes;
      // about statuses https://xrpl.org/transaction-results.html
      switch (prefix) {
         case "tes": // SUCCESS - Transaction was applied. Only final in a validated ledger.
            return TransactionSuccessStatus.SUCCESS;
         case "tec": // FAILED - Transaction failed, and only the fee was charged. Only final in a validated ledger.
            switch (result) {
               case "tecDST_TAG_NEEDED":
               case "tecNO_DST":
               case "tecNO_DST_INSUF_XRP":
               case "tecNO_PERMISSION":
                  return TransactionSuccessStatus.RECEIVER_FAILURE;
               default:
                  return TransactionSuccessStatus.SENDER_FAILURE;
            }
         case "tef":
            // FAILED - The transaction cannot be applied to the server's current (in-progress) ledger or any later one. It may have already been applied, or the condition of the ledger makes it impossible to apply in the future.
            return TransactionSuccessStatus.SENDER_FAILURE;
         case "tel":
            // LOCAL_ERROR - The transaction was not applied. The transaction was not applied to the ledger because it failed local checks, such as a bad signature or an unavailable fee level.
            return TransactionSuccessStatus.SENDER_FAILURE;
         case "tem":
            // MALFORMED - The transaction was not applied. The transaction was not applied to the ledger because it was malformed in some way, such as a bad signature or an unavailable fee level.
            return TransactionSuccessStatus.SENDER_FAILURE;
         case "ter":
            // FAILED_PROCESSING - The transaction was not applied. The transaction was not applied to the ledger because it failed to meet some other constraint imposed by the server.
            return TransactionSuccessStatus.SENDER_FAILURE;
         default:
            // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
            // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
            ((_: never): void => {})(prefix);
      }
      throw new Error(`Unexpected transaction status prefix found ${prefix}`);
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   public async paymentSummary(client?: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean): Promise<PaymentSummary> {
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
   public async makeFull(client?: MccClient): Promise<void> {
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
