import BN from "bn.js";
import { MccClient, TransactionSuccessStatus } from "../../types";
import { AlgoTransactionTypeOptions, IAlgoAdditionalData, IAlgoAssets, IAlgoTransactionMsgPack } from "../../types/algoTypes";
import { base32ToHex, bytesToHex, hexToBase32 } from "../../utils/algoUtils";
import { ALGO_MDU, ALGO_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { Managed } from "../../utils/managed";
import { isValidBytes32Hex, MccError, prefix0x, toBN, ZERO_BYTES_32 } from "../../utils/utils";
import { AddressAmount, PaymentSummary, TransactionBase } from "../TransactionBase";
const web3 = require("web3");
/**
 * docs https://developer.algorand.org/docs/get-details/transactions/transactions/
 */
@Managed()
export class AlgoTransaction extends TransactionBase<IAlgoTransactionMsgPack, IAlgoAdditionalData> {
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
      // for now mcc will only interpret the sender as the address that pays the fee (signs the transaction)
      return [hexToBase32(this.data.snd)];
   }

   public get assetSourceAddresses(): (string | undefined)[] {
      if (this.type === "axfer" || this.type === "axfer_close") {
         // for token transfers send by clawback transaction (https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-clawback-transaction)
         // and asset transfer transactions (https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-transfer-transaction)
         if (this.data.asnd) {
            return [hexToBase32(this.data.asnd)];
         }
         // Other kinds of asset transactions (axfer and axfer_close ) use snd field as sender
         return [hexToBase32(this.data.snd)];
      }
      // Other kinds of transactions have nothing to do with assets
      return [];
   }

   public get receivingAddresses(): (string | undefined)[] {
      const recAddresses = [];
      // for transactions of type pay
      if (this.type === "pay" || this.type === "pay_close") {
         if (this.data.rcv) {
            recAddresses.push(hexToBase32(this.data.rcv));
         }
         // If address is closed all remaining founds will be transferred to this address
         if (this.data.close) {
            recAddresses.push(hexToBase32(this.data.close));
         }
         return recAddresses;
      }
      return [];
   }

   public get assetReceivingAddresses(): (string | undefined)[] {
      const recAddresses = [];
      // for token interaction transactions
      if (this.type === "axfer" || this.type === "axfer_close") {
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
      if (this.type === "pay") {
         if (this.data.close) {
            // all assets that are not fee and received amount (amt) are transferred to close address
            throw new mccError(mccErrorCode.InvalidResponse, Error("Spend Amounts can't be extracted from transaction object on non-archival node"));
         }
         if (this.data.amt) {
            let amount = this.data.amt.toString();
            return [
               {
                  address: hexToBase32(this.data.snd),
                  amount: this.fee.add(toBN(amount)),
               },
            ];
         }
      }
      return [
         {
            // sender always pays the fee
            address: hexToBase32(this.data.snd),
            amount: this.fee,
         },
      ];
   }

   public get assetSpentAmounts(): AddressAmount[] {
      // for transactions of type axfer
      if (this.type === "axfer") {
         if (this.data.aamt) {
            let amount = this.data.aamt.toString();
            if (!(this.additionalData && this.additionalData.assetInfo)) {
               throw new mccError(mccErrorCode.InvalidResponse, Error("call the getAllData before to make sure additional data full"));
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
      if (this.type === "axfer_close") {
         throw new mccError(
            mccErrorCode.InvalidResponse,
            Error("Asset Spent Amounts can't be extracted for axfer_close transaction from transaction object on non-archival node")
         );
      }
      return [];
      // For now we don't support spending / using non-native tokens
   }

   public get receivedAmounts(): AddressAmount[] {
      // for transactions of type pay
      if (this.type === "pay_close") {
         throw new mccError(
            mccErrorCode.InvalidResponse,
            Error("Received Amounts can't be extracted from transaction object on non-archival node for close remainder to transactions")
         );
      }
      if (this.data) {
         if (this.data.amt) {
            let amount = this.data.amt.toString();
            return [
               {
                  address: this.receivingAddresses[0],
                  amount: toBN(amount),
               },
            ];
         }
      }

      return [];
   }

   public get assetReceivedAmounts(): AddressAmount[] {
      if (this.type === "axfer_close") {
         throw new mccError(
            mccErrorCode.InvalidResponse,
            Error("Received Amounts can't be extracted from transaction object on non-archival node for axfer close transactions")
         );
      }
      if (this.type === "axfer") {
         if (this.data.aamt) {
            let amount = this.data.aamt.toString();
            if (!(this.additionalData && this.additionalData.assetInfo)) {
               throw new mccError(mccErrorCode.InvalidResponse, Error("call the getAllData before to make sure additional data full"));
            }
            let decimals = this.additionalData.assetInfo.params.decimals;
            if (typeof decimals === "bigint") {
               decimals = Number(decimals);
            }
            return [
               {
                  address: this.assetReceivingAddresses[0],
                  amount: toBN(amount),
                  elementaryUnits: web3.utils.toBN(Math.pow(10, decimals)),
               },
            ];
         }
      }
      return [];
   }

   public get type(): AlgoTransactionTypeOptions {
      if (this.data.type === "pay") {
         if (this.data.close) {
            return "pay_close";
         }
      }
      if (this.data.type === "axfer") {
         if (this.data.aclose) {
            return "axfer_close";
         }
      }
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
         if (this.type === "axfer") {
            if (client && makeFullPayment) {
               await this.getTransactionAssetParams(client);
               // TODO payment summary for algorand token transaction
            } else {
               const ErrorMessage =
                  "To get all information about token transactions makeFullPayment must be set to true and an instance of client must be provided";
               throw new mccError(mccErrorCode.InvalidParameter, Error(ErrorMessage));
            }
         }
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

   //////////////////////////////////////////
   //// Algo transaction private methods ////
   //////////////////////////////////////////

   private async getTransactionAssetParams(client: MccClient): Promise<void> {
      if (this.data.xaid) {
         if (!this.additionalData) {
            this.additionalData = {};
         }
         if (!this.additionalData.assetInfo) {
            // @ts-ignore
            this.additionalData.assetInfo = await client.getAssetInfo(this.data.xaid);
         }
      }
   }
}
