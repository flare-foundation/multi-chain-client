import { IAlgoGetBlockRes } from "../../types";
import { base64ToHex, filterHashes, txIdToHexNo0x } from "../../utils/algoUtils";
import { prefix0x } from "../../utils/utils";
import { BlockBase } from "../BlockBase";

export class AlgoBlock extends BlockBase<IAlgoGetBlockRes> {
   public get number(): number {
      return this.data.round;
   }

   public get blockHash(): string {
      return this.data.cert.prop.dig;
   }

   public get stdBlockHash(): string {
      return base64ToHex(this.data.cert.prop.dig);
   }

   public get unixTimestamp(): number {
      return this.data.timestamp;
   }

   public get transactionIds(): string[] {
      if (this.data.transactions === undefined) {
         return [];
      }
      return this.data.transactions.map(filterHashes);
   }

   public get stdTransactionIds(): string[] {
      return this.transactionIds.map(txIdToHexNo0x);
   }

   public get transactionCount(): number {
      if (this.data.transactions === undefined) {
         return 0;
      }
      return this.data.transactions.length;
   }
}
