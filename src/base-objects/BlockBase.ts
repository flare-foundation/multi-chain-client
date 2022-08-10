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
    * Block hash directly from underlying node
    */
   public abstract get blockHash(): string;

   /**
    * Flare standardized block hash (hex encoded string of length 64 (32 bytes) without 0x prefix)
    */
   public abstract get stdBlockHash(): string;

   /**
    * block timestamp as unix time (elapsed seconds since 1.1.1970)
    */
   public abstract get unixTimestamp(): number;

   /**
    * Array of transaction ids of all transactions in block
    */
   public abstract get transactionIds(): string[];

   /**
    * Array of flare standardized transaction ids in block (hex encoded string of length 64 (32 bytes) without 0x prefix)
    */
   public abstract get stdTransactionIds(): string[];

   /**
    * Number of transactions in block
    */
   public abstract get transactionCount(): number;

   /**
    * Return if block is valid
    * Mainly for XRP
    */
    public get isValid(): boolean {
      return true;
    }
}

export { AlgoBlock } from "./blocks/AlgoBlock";
export { BtcBlock } from "./blocks/BtcBlock";
export { DogeBlock } from "./blocks/DogeBlock";
export { LtcBlock } from "./blocks/LtcBlock";
export { UtxoBlock } from "./blocks/UtxoBlock";
export { XrpBlock } from "./blocks/XrpBlock";
export { LiteBlock } from  "./blocks/LiteBlock";