import { IUtxoGetBlockRes } from "../../types";
import { mccOutsideError } from "../../utils/errors";
import { prefix0x } from "../../utils/utils";
import { BlockBase } from "../BlockBase";

export class UtxoBlock extends BlockBase<IUtxoGetBlockRes> {
   public get number(): number {
      try {
         return this.data.height;
      }
      catch (error) {
         throw new mccOutsideError(error);
      }
   }

   public get blockHash(): string {
      try {
         return this.data.hash;
      }
      catch (error) {
         throw new mccOutsideError(error);
      }
   }

   public get stdBlockHash(): string {
      return this.data.hash;
   }

   public get unixTimestamp(): number {
      return this.data.time;
   }

   public get transactionIds(): string[] {
      return this.data.tx!.map((tx) => {
         if (!tx) {
            console.error(`UtxoBlock::transactionIds null tx`);

            return "0x0";
         }

         if (tx.txid) {
            return prefix0x(tx.txid);
         } else {
            if (typeof tx === "string") {
               return prefix0x(tx as any as string);
            } else {
               console.error(`UtxoBlock::transactionIds non-standard tx`);

               console.log(tx);

               return "0x0";
            }
         }
         // tx.txid ? prefix0x(tx.txid) : ( prefix0x(tx as any as string)));
      });
   }

   public get stdTransactionIds(): string[] {
      // todo: @Luka: tx is already Id on DOGE
      return this.data.tx!.map((tx) => (tx.txid ? tx.txid : (tx as any as string)));
   }

   public get transactionCount(): number {
      return this.data.tx.length;
   }
}
