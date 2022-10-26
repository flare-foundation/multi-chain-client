import { IUtxoGetBlockHeaderRes } from "../../types";
import { Managed } from "../../utils/managed";
import { BlockHeaderBase } from "../BlockBase";

@Managed()
export class UtxoBlockHeader extends BlockHeaderBase<IUtxoGetBlockHeaderRes> {
   public get previousBlockHash(): string {
      return this.data.previousblockhash;
   }

   public get stdPreviousBlockHash(): string {
      return this.previousBlockHash;
   }

   public get unixTimestamp(): number {
      return this.data.mediantime;
   }

   public get transactionCount(): number {
      return this.data.nTx;
   }

   public get number(): number {
      return this.data.height;
   }

   public get blockHash(): string {
      return this.data.hash;
   }

   public get stdBlockHash(): string {
      return this.blockHash;
   }
}
