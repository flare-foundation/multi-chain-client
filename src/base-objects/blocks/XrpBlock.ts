import { IXrpGetBlockRes } from "../../types/xrpTypes";
import { XRP_UTD } from "../../utils/constants";
import { BlockBase } from "../BlockBase";

export class XrpBlock extends BlockBase {
    protected get data(): IXrpGetBlockRes {
        return this.privateData as IXrpGetBlockRes;
    }

    public get number(): number {
        return this.data.result.ledger_index;
    }

    public get blockHash(): string {
        return this.data.result.ledger_hash;
    }

    public get stdBlockHash(): string {
        return this.blockHash;
    }

    public get previousBlockHash(): string {
        return this.data.result.ledger.parent_hash;
    }

    public get stdPreviousBlockHash(): string {
        return this.previousBlockHash;
    }

    /**
     * Gets the close_time of a block converted to unix time
     */
    public get unixTimestamp(): number {
        return XRP_UTD + this.data.result.ledger.close_time;
    }

    public get transactionIds(): string[] {
        if (!this.data.result.ledger.transactions) return [];
        if (this.data.result.ledger.transactions.length === 0) return [];
        if (typeof this.data.result.ledger.transactions[0] === "string") return this.data.result.ledger.transactions as string[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return this.data.result.ledger.transactions.map((tx: any) => tx.hash);
    }

    public get stdTransactionIds(): string[] {
        return this.transactionIds;
    }

    public get transactionCount(): number {
        return this.data.result.ledger.transactions?.length || 0;
    }
    // problematic ???invalid in BlockBase ???
    public get isValid(): boolean {
        return this.data.result.validated === true ? true : false;
    }
}
