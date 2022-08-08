import { IXrpGetBlockRes } from "../../types/xrpTypes";
import { XRP_UTD } from "../../utils/constants";
import { Managed } from "../../utils/managed";
import { BlockBase } from "../BlockBase";

@Managed()
export class XrpBlock extends BlockBase<IXrpGetBlockRes> {
   public get number(): number {
      return this.data.result.ledger_index;
   }

   public get blockHash(): string {
      return this.data.result.ledger_hash;
   }

   public get stdBlockHash(): string {
      return this.blockHash;
   }

   public get unixTimestamp(): number {
      return XRP_UTD + this.data.result.ledger.close_time;
   }

   public get transactionIds(): string[] {
      return (this.data.result.ledger.transactions! as any).map((tx: any) => (tx as any).hash);
   }

   public get stdTransactionIds(): string[] {
      return this.transactionIds;
   }

   public get transactionCount(): number {
      return this.data.result.ledger.transactions?.length || 0;
   }

   public get isValid(): boolean {
      return this.data.result.validated!;
   }
}
