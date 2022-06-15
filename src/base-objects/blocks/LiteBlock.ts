import { IGetLiteBlockRes } from "../../types/genericMccTypes";
import { GetTryCatchWrapper } from "../../utils/errors";
import { BlockBase } from "../BlockBase";

const util = require("util");

export class LiteBlock extends BlockBase<IGetLiteBlockRes> {
   @GetTryCatchWrapper()
   public get number(): number {
      return this.data.number;
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
      return 0;
   }

   @GetTryCatchWrapper()
   public get transactionIds(): string[] {
      throw new Error("Method not implemented.");
   }

   @GetTryCatchWrapper()
   public get stdTransactionIds(): string[] {
      throw new Error("Method not implemented.");
   }

   @GetTryCatchWrapper()
   public get transactionCount(): number {
      throw new Error("Method not implemented.");
   }

   [util.inspect.custom]() {
      return `Number: ${this.number}; Hash: ${this.stdBlockHash}`;
   }
}
