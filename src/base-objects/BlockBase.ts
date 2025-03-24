export abstract class BlockTipBase {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected privateData: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.privateData = data;
    }

    /**
     * Exposing the private data for the derived classes (dev only/python like privatization)
     */
    public get _data() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.privateData;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected abstract get data(): any;

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

export function blockConstructor<A extends BlockBase>(c: new () => A): A {
    return new c();
}

export function blockHeaderConstructor<A extends BlockHeaderBase>(c: new () => A): A {
    return new c();
}

export function blockTipConstructor<A extends BlockTipBase>(c: new () => A): A {
    return new c();
}
