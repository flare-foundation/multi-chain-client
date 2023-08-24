import { BlockBase, BlockHeaderBase, BlockTipBase, FullBlockBase, TransactionBase } from "../base-objects";
import { RPCInterface } from "./genericMccTypes";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DogeRpcInterface<
    BT extends BlockTipBase,
    BH extends BlockHeaderBase,
    B extends BlockBase,
    FB extends FullBlockBase<T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends TransactionBase<any>
> extends RPCInterface<BT, BH, B, FB, T> {}
