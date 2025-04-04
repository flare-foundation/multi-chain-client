import { IUtxoGetBlockRes } from "../../types";
import { FullBlockBase } from "../FullBlockBase";
import { UtxoBlock } from "../blocks/UtxoBlock";
import { UtxoTransaction } from "../transactions/UtxoTransaction";

export class UtxoFullBlock<T extends UtxoTransaction> extends UtxoBlock implements FullBlockBase<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transactionConstructor: any;
    constructor(data: IUtxoGetBlockRes) {
        super(data);
        // Must be implemented in specific chain class
        this.transactionConstructor = UtxoTransaction;
    }

    public get transactions(): T[] {
        if (!this.data.tx) return [];
        const transactions: T[] = [];
        for (const txData of this.data.tx) {
            const modifiedTxData = {
                blockhash: this.stdBlockHash,
                mediantime: this.unixTimestamp,
                confirmations: this.data.confirmations, // NOTE: can be -1 if block not on main chain
                blocktime: this.unixTimestamp,
                ...txData,
            };
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
            transactions.push(new this.transactionConstructor(modifiedTxData));
        }
        return transactions;
    }
}
