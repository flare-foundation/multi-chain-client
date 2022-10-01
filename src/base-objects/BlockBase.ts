import { mccError, mccErrorCode } from "../utils/errors";
export abstract class BlockTipBase<B> {
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
    * Only return something on Tips
    */
   public get chainTipStatus(): string | null {
      throw new mccError(mccErrorCode.InvalidMethodCall, Error("ChainTipStatus is not implemented on this object"));
   }
}

export abstract class BlockHeaderBase<B> extends BlockTipBase<B> {
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

export abstract class BlockBase<B> extends BlockHeaderBase<B> {
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

export type IBlockTip = BlockTipBase<any>;
export type IBlockHeader = BlockHeaderBase<any>;
export type IBlock = BlockBase<any>;



// Block Tips
export { BtcBlockTip } from "./blockTips/BtcBlockTip";
export { DogeBlockTip } from "./blockTips/DogeBlockTip";
export { LtcBlockTip } from "./blockTips/LtcBlockTip";
export { UtxoBlockTip } from "./blockTips/UtxoBlockTip";

/**
 * Algo and Ripple (XRP) have no specific block header endpoint (liter block with limited data)
 */
// Block headers
export { BtcBlockHeader } from "./blockHeaders/BtcBlockHeader";
export { DogeBlockHeader } from "./blockHeaders/DogeBlockHeader";
export { LtcBlockHeader } from "./blockHeaders/LtcBlockHeader";
export { UtxoBlockHeader } from "./blockHeaders/UtxoBlockHeader";

// Blocks
export { AlgoBlock } from "./blocks/AlgoBlock";
export { BtcBlock } from "./blocks/BtcBlock";
export { DogeBlock } from "./blocks/DogeBlock";
export { LtcBlock } from "./blocks/LtcBlock";
export { UtxoBlock } from "./blocks/UtxoBlock";
export { XrpBlock } from "./blocks/XrpBlock";


