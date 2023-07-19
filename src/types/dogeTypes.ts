import { BlockBase, BlockHeaderBase, BlockTipBase, FullBlockBase, TransactionBase } from "../base-objects";
import { RPCInterface } from "./genericMccTypes";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DogeRpcInterface<
   BT extends BlockTipBase,
   BH extends BlockHeaderBase,
   B extends BlockBase,
   FB extends FullBlockBase<T>,
   T extends TransactionBase
> extends RPCInterface<BT, BH, B, FB, T> {}
