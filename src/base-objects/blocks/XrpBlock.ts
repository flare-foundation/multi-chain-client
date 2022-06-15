import { IXrpGetBlockRes } from "../../types/xrpTypes";
import { XRP_UTD } from "../../utils/constants";
import { GetTryCatchWrapper } from "../../utils/errors";
import { BlockBase } from "../BlockBase";

export class XrpBlock extends BlockBase<IXrpGetBlockRes> {
   @GetTryCatchWrapper()
   public get number(): number {
      return this.data.result.ledger_index;
   }

   @GetTryCatchWrapper()
   public get blockHash(): string {
      return this.data.result.ledger_hash;
   }

   @GetTryCatchWrapper()
   public get stdBlockHash(): string {
      return this.blockHash;
   }

   @GetTryCatchWrapper()
   public get unixTimestamp(): number {
      return XRP_UTD + this.data.result.ledger.close_time;
   }

   @GetTryCatchWrapper()
   public get transactionIds(): string[] {
      return (this.data.result.ledger.transactions! as any).map((tx: any) => (tx as any).hash);
   }

   @GetTryCatchWrapper()
   public get stdTransactionIds(): string[] {
      throw this.transactionIds;
   }

   @GetTryCatchWrapper()
   public get transactionCount(): number {
      return this.data.result.ledger.transactions?.length || 0;
   }
}
