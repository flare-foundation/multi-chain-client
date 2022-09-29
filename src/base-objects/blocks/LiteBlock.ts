import { IGetLiteBlockRes } from "../../types/genericMccTypes";
import { mccError, mccErrorCode } from "../../utils/errors";
import { Managed } from "../../utils/managed";
import { BlockBase } from "../BlockBase";

@Managed()
export class LiteBlock extends BlockBase<IGetLiteBlockRes> {
   public get number(): number {
      return this.data.number;
   }

   public get blockHash(): string {
      return this.data.hash;
   }

   public get stdBlockHash(): string {
      return this.data.hash;
   }

   public get previousBlockHash(): string {
      throw new mccError(
         mccErrorCode.InvalidMethodCall,
         Error("Method not implemented.")
      );
   }
   
   public get stdPreviousBlockHash(): string {
      throw new mccError(
         mccErrorCode.InvalidMethodCall,
         Error("Method not implemented.")
      );
   }

   public get unixTimestamp(): number {
      return 0;
   }

   public get transactionIds(): string[] {
      return [];
   }

   public get stdTransactionIds(): string[] {
      return [];
   }

   public get transactionCount(): number {
      return 0;
   }

   public get chainTipStatus() {
      return this.data.status
   }
}
