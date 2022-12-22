import { IXrpGetBlockHeaderRes } from "../../types/xrpTypes";
import { XRP_UTD } from "../../utils/constants";
import { Managed } from "../../utils/managed";
import { BlockHeaderBase } from "../BlockBase";

@Managed()
export class XrpBlockHeader extends BlockHeaderBase<IXrpGetBlockHeaderRes> {
   public get previousBlockHash(): string {
      return this.data.result.ledger.parent_hash;
   }

   public get stdPreviousBlockHash(): string {
      return this.previousBlockHash;
   }

   public get unixTimestamp(): number {
      return XRP_UTD + this.data.result.ledger.close_time;
   }

   public get transactionCount(): number {
      return this.data.result.ledger.transactions?.length || 0;
   }

   public get number(): number {
      return this.data.result.ledger_index;
   }

   public get blockHash(): string {
      return this.data.result.ledger_hash;
   }

   public get stdBlockHash(): string {
      return this.blockHash;
   }
}
