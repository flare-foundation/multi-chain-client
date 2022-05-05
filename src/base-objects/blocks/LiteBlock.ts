import { IGetLiteBlockRes } from "../../types/genericMccTypes";
import { BlockBase } from "../BlockBase";

const util = require("util");

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

   public get unixTimestamp(): number {
      return 0;
   }
   
   public get transactionIds(): string[] {
      throw new Error("Method not implemented.");
   }

   public get stdTransactionIds(): string[] {
      throw new Error("Method not implemented.");
   }
   
   public get transactionCount(): number {
      throw new Error("Method not implemented.");
   }

   [util.inspect.custom]() {
      return `Number: ${this.number}; Hash: ${this.stdBlockHash}`;
   }
}
