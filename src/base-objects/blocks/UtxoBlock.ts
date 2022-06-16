import { IUtxoGetBlockRes } from "../../types";
import { GetTryCatchWrapper, mccOutsideError } from "../../utils/errors";
import { Trace } from "../../utils/trace";
import { prefix0x } from "../../utils/utils";
import { BlockBase } from "../BlockBase";


@Trace()
export class UtxoBlock extends BlockBase<IUtxoGetBlockRes> {
   //@GetTryCatchWrapper()
   public get number(): number {
      return this.data.height;
   }

   @GetTryCatchWrapper()
   public get blockHash(): string {
      return this.data.hash;
   }

   @GetTryCatchWrapper()
   public get stdBlockHash(): string {
      return this.data.hash;
   }

   @GetTryCatchWrapper()
   public get unixTimestamp(): number {
      return this.data.time;
   }

   @GetTryCatchWrapper()
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

   @GetTryCatchWrapper()
   public get stdTransactionIds(): string[] {
      // todo: @Luka: tx is already Id on DOGE
      return this.data.tx!.map((tx) => (tx.txid ? tx.txid : (tx as any as string)));
   }

   @GetTryCatchWrapper()
   public get transactionCount(): number {
      return this.data.tx.length;
   }
}
