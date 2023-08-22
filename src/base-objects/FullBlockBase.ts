import { BlockBase } from "./BlockBase";
import { TransactionBase } from "./TransactionBase";

/**
 * Base class for blocks that also include all transactions (including information about the transaction)
 */
export abstract class FullBlockBase<T extends TransactionBase> extends BlockBase {
    /**
     * Array of transactions objects in block
     */
    public abstract get transactions(): T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fullBlockConstructor<A extends FullBlockBase<any>>(c: new () => A): A {
    return new c();
}
