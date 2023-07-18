import { BTC_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { toBN } from "../../utils/utils";
import { AddressAmount } from "../TransactionBase";
import { BtcAddress } from "../addressObjects/BtcAddress";
import { UtxoTransaction, UtxoTransactionTypeOptions } from "./UtxoTransaction";
import BN from "bn.js";

export class BtcTransaction extends UtxoTransaction {
   // Btc specific transaction

   public get currencyName(): string {
      return BTC_NATIVE_TOKEN_NAME;
   }

   public isValidPkscript(index: number): boolean {
      const vout = this.extractVoutAt(index);
      if (!vout.scriptPubKey.address) return true; //OP_RETURN
      const address = new BtcAddress(vout.scriptPubKey.address);
      return address.addressToPkscript() == vout.scriptPubKey.hex;
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
            Error("fee can't be calculated, the transaction data does not contain the prevouts field (verbosity 2)")
         );
         throw error;
      }
   }

   public get type(): UtxoTransactionTypeOptions {
      if (this.data.vin.length === 0 || this.data.vin[0].coinbase) {
         return "coinbase";
      }
      if (this.hasPrevouts) return "full_payment";
      return "payment";
   }

   // BTC transaction specific helper methods

   get hasPrevouts(): boolean {
      return this.data.vin.every((vin) => {
         return vin.prevout !== undefined || vin.coinbase !== undefined;
      });
   }
}
