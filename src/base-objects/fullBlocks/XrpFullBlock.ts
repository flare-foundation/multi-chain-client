import { IXrpGetTransactionRes } from "../../types";
import { FullBlockBase } from "../FullBlockBase";
import { XrpBlock } from "../blocks/XrpBlock";
import { XrpTransaction } from "../transactions/XrpTransaction";

export class XrpFullBlock extends XrpBlock implements FullBlockBase<XrpTransaction> {
    public get transactions(): XrpTransaction[] {
        if (!this.data.result.ledger.transactions) return [];
        const transactions: XrpTransaction[] = [];
        for (const txData of this.data.result.ledger.transactions) {
            if (typeof txData === "string") {
                // Maybe raise invalid node response error
                return [];
            }
            const { metaData: _, ...txDataRest } = txData;
            const modifiedTxData: IXrpGetTransactionRes = {
                result: {
                    ...txDataRest,
                    // TODO: this is due to xrpl.js lib mistakes
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    hash: txData.hash,
                    ledger_index: this.number,
                    meta: txData.metaData,
                    validated: this.isValid,
                    date: this.data.result.ledger.close_time,
                },
                // TODO: this is due to xrpl.js lib mistakes
                id: "",
                type: "",
            };
            transactions.push(new XrpTransaction(modifiedTxData));
        }
        return transactions;
    }
}
