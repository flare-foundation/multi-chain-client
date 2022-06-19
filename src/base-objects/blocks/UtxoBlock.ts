import { IUtxoGetBlockRes } from "../../types";
import { Managed } from "../../utils/managed";
import { prefix0x } from "../../utils/utils";
import { BlockBase } from "../BlockBase";

@Managed()
export class UtxoBlock extends BlockBase<IUtxoGetBlockRes> {

   //
   public get number(): number {
      return this.data.height;
   }

   public get blockHash(): string {
      return this.data.hash;
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
            return "0x0";
         }
         if (tx.txid) {
            return prefix0x(tx.txid);
         } else {
            if (typeof tx === "string") {
               return prefix0x(tx as any as string);
            } else {
               return "0x0";
            }
         }
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
