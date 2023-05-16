import { TransactionBase } from "./TransactionBase";

export abstract class BlockTipBase {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   protected privateData: any;

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   constructor(data: any) {
      this.privateData = data;
   }

   /**
    * Exposing the private data for the derived classes (dev only/python like privatization)
    */
   public get _data() {
      return this.privateData;
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
    * Only return something on Tips
    */
   public get chainTipStatus(): string {
      return "active";
   }
}

export abstract class BlockHeaderBase extends BlockTipBase {
   /**
    * Previous block hash directly from underlying node
    */
   public abstract get previousBlockHash(): string;

   /**
    * Flare standardized previous block hash (hex encoded string of length 64 (32 bytes) without 0x prefix)
    */
   public abstract get stdPreviousBlockHash(): string;

   /**
    * block timestamp as unix time (elapsed seconds since 1.1.1970)
    */
   public abstract get unixTimestamp(): number;
   /**
    * Number of transactions in block
    */
   public abstract get transactionCount(): number;
}

export abstract class BlockBase extends BlockHeaderBase {
   /**
    * Array of transaction ids of all transactions in block
    */
   public abstract get transactionIds(): string[];

   /**
    * Array of flare standardized transaction ids in block (hex encoded string of length 64 (32 bytes) without 0x prefix)
    */
   public abstract get stdTransactionIds(): string[];

   /**
    * Return if block is valid
    * Mainly for XRP
    */
   public get isValid(): boolean {
      return true;
   }
}

/**
 * Base class for blocks that also include all transactions (including information about the transaction)
 */
export abstract class FullBlockBase<T extends TransactionBase> extends BlockBase {
   /**
    * Array of transactions objects in block
    */
   public abstract get transactions(): T[];
}

export function blockConstructor<A extends BlockBase>(c: new () => A): A {
   return new c();
}

export function blockHeaderConstructor<A extends BlockHeaderBase>(c: new () => A): A {
   return new c();
}

export function blockTipConstructor<A extends BlockTipBase>(c: new () => A): A {
   return new c();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fullBlockConstructor<A extends FullBlockBase<any>>(c: new () => A): A {
   return new c();
}

// Block Tips
/**
 * Algo and Ripple (XRP) have no specific block header endpoint (liter block with limited data)
 */
// Block headers
export { BtcBlockHeader } from "./blockHeaders/BtcBlockHeader";
export { DogeBlockHeader } from "./blockHeaders/DogeBlockHeader";
export { LtcBlockHeader } from "./blockHeaders/LtcBlockHeader";
export { UtxoBlockHeader } from "./blockHeaders/UtxoBlockHeader";
export { BtcBlockTip } from "./blockTips/BtcBlockTip";
export { DogeBlockTip } from "./blockTips/DogeBlockTip";
export { LtcBlockTip } from "./blockTips/LtcBlockTip";
export { UtxoBlockTip } from "./blockTips/UtxoBlockTip";
// Blocks
export { AlgoBlock } from "./blocks/AlgoBlock";
export { BtcBlock } from "./blocks/BtcBlock";
export { DogeBlock } from "./blocks/DogeBlock";
export { LtcBlock } from "./blocks/LtcBlock";
export { UtxoBlock } from "./blocks/UtxoBlock";
export { XrpBlock } from "./blocks/XrpBlock";
// Full blocks
export { BtcFullBlock } from "./fullBlocks/BtcFullBlock";
export { DogeFullBlock } from "./fullBlocks/DogeFullBlock";
export { LtcFullBlock } from "./fullBlocks/LtcFullBlock";
export { UtxoFullBlock } from "./fullBlocks/UtxoFullBlock";
export { XrpFullBlock } from "./fullBlocks/XrpFullBlock";
