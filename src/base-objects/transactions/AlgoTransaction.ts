import BN from "bn.js";
import { MccClient, TransactionSuccessStatus } from "../../types";
import { AlgoTransactionTypeOptions, IAlgoTransactionMsgPack } from "../../types/algoTypes";
import { base32ToHex, bytesToHex, hexToBase32 } from "../../utils/algoUtils";
import { ALGO_MDU, ALGO_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { Managed } from "../../utils/managed";
import { isValidBytes32Hex, prefix0x, toBN, ZERO_BYTES_32 } from "../../utils/utils";
import { AddressAmount, PaymentSummary, TransactionBase } from "../TransactionBase";
const web3 = require("web3");
/**
 * docs https://developer.algorand.org/docs/get-details/transactions/transactions/
 */
@Managed()
export class AlgoTransaction extends TransactionBase<IAlgoTransactionMsgPack, any> {
   public get txid(): string {
      return this.data.txid;
   }

   public get stdTxid(): string {
      return base32ToHex(this.data.txid);
   }

   public get hash(): string {
      return this.txid;
   }

   public get reference(): string[] {
      if (this.data.note) {
         return [bytesToHex(this.data.note)];
      }
      return [];
   }

   public get stdPaymentReference(): string {
      let paymentReference = this.reference.length === 1 ? prefix0x(this.reference[0]) : "";
      try {
         // try to parse out
         paymentReference = prefix0x(web3.utils.hexToString(prefix0x(paymentReference)));
      } catch (e) {
         /* istanbul ignore next */
         // Should not happen
         return ZERO_BYTES_32;
      }
      if (!isValidBytes32Hex(paymentReference)) {
         paymentReference = ZERO_BYTES_32;
      }
      return paymentReference;
   }

   public get unixTimestamp(): number {
      return this.data.timestamp;
   }

   public get sourceAddresses(): (string | undefined)[] {
      if (this.type === "axfer") {
         // for token transfers send by clawback transaction (https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-clawback-transaction) and asset transfer transactions (https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-transfer-transaction)
         if (this.data.asnd) {
            return [hexToBase32(this.data.asnd)];
         }
      }
      return [hexToBase32(this.data.snd)];
   }

   public get receivingAddresses(): (string | undefined)[] {
      // for transactions of type pay
      const recAddresses = [];
      if (this.type === "pay") {
         if (this.data.rcv) {
            recAddresses.push(hexToBase32(this.data.rcv));
         }
         // If address is closed all remaining founds will be transferred to this address
         if (this.data.close) {
            recAddresses.push(hexToBase32(this.data.close));
         }
         return recAddresses;
      }
      // for transactions of type axfer
      else if (this.type === "axfer") {
         if (this.data.arcv) {
            recAddresses.push(hexToBase32(this.data.arcv));
         }
         if (this.data.aclose) {
            recAddresses.push(hexToBase32(this.data.aclose));
         }
         return recAddresses;
      }
      return [];
   }

   public get fee(): BN {
      return toBN(this.data.fee || 0);
   }

   public get spentAmounts(): AddressAmount[] {
      // for transactions of type pay
      if (this.data.amt) {
         let amount = this.data.amt.toString();
         return [
            {
               address: this.sourceAddresses[0],
               amount: this.fee.add(toBN(amount)),
            },
         ];
      }
      // for transactions of type axfer
      if (this.data.aamt) {
         let amount = this.data.aamt.toString();
         return [
            {
               address: this.sourceAddresses[0],
               amount: this.fee.add(toBN(amount)),
            },
         ];
      }
      return [
         {
            address: this.sourceAddresses[0],
            amount: this.fee,
         },
      ];
   }

   public get receivedAmounts(): AddressAmount[] {
      // for transactions of type pay
      if (this.data.amt) {
         let amount = this.data.amt.toString();
         return [
            {
               address: this.receivingAddresses[0],
               amount: toBN(amount),
            },
         ];
      }
      // for transactions of type axfer
      if (this.data.aamt) {
         let amount = this.data.aamt.toString();
         // TODO add asset close amount to this response
         return [
            {
               address: this.receivingAddresses[0],
               amount: toBN(amount),
            },
         ];
      }
      return [];
   }

   public get type(): AlgoTransactionTypeOptions {
      return this.data.type as AlgoTransactionTypeOptions;
   }

   public get isNativePayment(): boolean {
      return this.type === "pay";
   }

   public get currencyName(): string {
      if (this.type === "pay") {
         return ALGO_NATIVE_TOKEN_NAME;
      } else if (this.type === "axfer" && this.data.xaid) {
         return this.data.xaid.toString();
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

   public async paymentSummary(client?: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean): Promise<PaymentSummary> {
      if (!this.isNativePayment) {
         return { isNativePayment: false };
      }
      return {
         isNativePayment: true,
         sourceAddress: this.sourceAddresses[0],
         receivingAddress: this.receivingAddresses[0],
         spentAmount: this.spentAmounts[0].amount,
         receivedAmount: this.receivedAmounts[0].amount,
         paymentReference: this.stdPaymentReference,
         oneToOne: true,
         isFull: true,
      };
   }
}
