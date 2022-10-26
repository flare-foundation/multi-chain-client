import { IAlgoGetIndexerBlockRes, IAlgoTransaction } from "../../types";
import { hexToBase64, txIdToHexNo0x } from "../../utils/algoUtils";
import { Managed } from "../../utils/managed";
import { BlockBase } from "../BlockBase";

function filterHashesIndexer(trans: IAlgoTransaction) {
   if (trans.id) {
      return trans.id;
   } else {
      return "";
   }
}

@Managed()
export class AlgoIndexerBlock extends BlockBase<IAlgoGetIndexerBlockRes> {
   public get number(): number {
      return this.data.round;
   }

   public get blockHash(): string {
      return hexToBase64(this.data.cert.prop.dig);
   }

   public get stdBlockHash(): string {
      return this.data.cert.prop.dig;
   }

   public get previousBlockHash(): string {
      throw new Error("Method not implemented.");
   }

   public get stdPreviousBlockHash(): string {
      throw new Error("Method not implemented.");
   }

   public get unixTimestamp(): number {
      return this.data.timestamp;
   }

   public get transactionIds(): string[] {
      if (this.data.transactions === undefined) {
         return [];
      }
      return this.data.transactions.map(filterHashesIndexer);
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
