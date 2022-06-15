import BN from "bn.js";
import { MccClient, TransactionSuccessStatus } from "../../types";
import { IAlgoTransactionMsgPack } from "../../types/algoTypes";
import { base32ToHex, bytesToHex, hexToBase32 } from "../../utils/algoUtils";
import { ALGO_MDU, ALGO_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { AsyncTryCatchWrapper, GetTryCatchWrapper, SyncTryCatchWrapper } from "../../utils/errors";
import { Trace } from "../../utils/trace";
import { isValidBytes32Hex, prefix0x, toBN, ZERO_BYTES_32 } from "../../utils/utils";
import { AddressAmount, PaymentSummary, TransactionBase } from "../TransactionBase";
const web3 = require("web3");
/**
 * docs https://developer.algorand.org/docs/get-details/transactions/transactions/
 */
export class AlgoTransaction extends TransactionBase<IAlgoTransactionMsgPack, any> {
   @GetTryCatchWrapper()
   public get txid(): string {
      return this.data.txid;
   }

   @GetTryCatchWrapper()
   public get stdTxid(): string {
      return base32ToHex(this.data.txid);
   }

   @GetTryCatchWrapper()
   public get hash(): string {
      return this.txid;
   }

   @GetTryCatchWrapper()
   public get reference(): string[] {
      if (this.data.note) {
         return [bytesToHex(this.data.note)];
      }
      return [""];
   }

   @GetTryCatchWrapper()
   public get stdPaymentReference(): string {
      let paymentReference = this.reference?.length === 1 ? prefix0x(this.reference[0]) : "";
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

   @GetTryCatchWrapper()
   public get unixTimestamp(): number {
      return this.data.timestamp;
   }

   @GetTryCatchWrapper()
   public get sourceAddresses(): (string | undefined)[] {
      return [hexToBase32(this.data.snd)];
   }

   @GetTryCatchWrapper()
   public get receivingAddresses(): (string | undefined)[] {
      // for transactions of type pay
      if (this.data.rcv) {
         return [hexToBase32(this.data.rcv)];
      }
      // for transactions of type axfer
      else if (this.data.arcv) {
         return [hexToBase32(this.data.arcv)];
      }
      return [];
   }

   @GetTryCatchWrapper()
   public get fee(): BN {
      return toBN(this.data.fee || 0);
   }

   @GetTryCatchWrapper()
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
      // TODO
      if (this.data.aamt) {
         let amount = this.data.aamt.toString();
         return [
            {
               address: this.sourceAddresses[0],
               amount: this.fee,
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

   @GetTryCatchWrapper()
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
         return [
            {
               address: this.receivingAddresses[0],
               amount: toBN(amount),
            },
         ];
      }
      return [];
   }

   @GetTryCatchWrapper()
   public get type(): string {
      return this.data.type;
   }

   @GetTryCatchWrapper()
   public get isNativePayment(): boolean {
      return this.type === "pay";
   }

   @GetTryCatchWrapper()
   public get currencyName(): string {
      if (this.type === "pay") {
         return ALGO_NATIVE_TOKEN_NAME;
      } else if (this.type === "axfer" && this.data.xaid) {
         return this.data.xaid.toString();
      }
      return "";
   }

   @GetTryCatchWrapper()
   public get elementaryUnits(): BN {
      return toBN(ALGO_MDU);
   }

   @GetTryCatchWrapper()
   public get successStatus(): TransactionSuccessStatus {
      // TODO research this further
      return TransactionSuccessStatus.SUCCESS;
   }

   @AsyncTryCatchWrapper()
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
