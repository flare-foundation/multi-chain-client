export type IBlock = BlockBase<any>;
export abstract class BlockBase<B> {
   data: B;

   constructor(data: B) {
      this.data = data;
   }

   /**
    * Block number sometimes refers to as block height or ledger height (number of block in blockchain)
    */
   public abstract get number(): number;

   /**
    * 
    */
   public abstract get blockHash(): string;
   public abstract get stdBlockHash(): string;
   public abstract get unixTimestamp(): number;
   public abstract get transactionIds(): string[];
   public abstract get stdTransactionIds(): string[];
   public abstract get transactionCount(): number;
}

export { AlgoIndexerBlock } from "./blocks/AlgoIndexerBlock";
export { AlgoBlock } from "./blocks/AlgoBlock";
export { BtcBlock } from "./blocks/BtcBlock";
export { DogeBlock } from "./blocks/DogeBlock";
export { LtcBlock } from "./blocks/LtcBlock";
export { UtxoBlock } from "./blocks/UtxoBlock";
export { XrpBlock } from "./blocks/XrpBlock";
