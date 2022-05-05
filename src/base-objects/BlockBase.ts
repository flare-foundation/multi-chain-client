import { StringMappingType } from "typescript";

export type IBlock = BlockBase<any>;
export abstract class BlockBase<B> {
   data: B;

   constructor(data: B) {
      this.data = data;
   }

   public abstract get number(): number;
   public abstract get blockHash(): string;
   public abstract get stdBlockHash(): string;
   public abstract get unixTimestamp(): number;
   public abstract get transactionIds(): string[];
   public abstract get stdTransactionIds(): string[];
   public abstract get transactionCount(): number;
}

export { AlgoBlock } from "./blocks/AlgoBlock";
export { XrpBlock } from "./blocks/XrpBlock";
export { UtxoBlock } from "./blocks/UtxoBlock";

export { BtcBlock } from "./blocks/BtcBlock";
export { DogeBlock } from "./blocks/DogeBlock";
export { LtcBlock } from "./blocks/LtcBlock";
