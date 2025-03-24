import { prefix0x } from "../../utils/utils";
import { UtxoBlock } from "./UtxoBlock";

export class DogeBlock extends UtxoBlock {
    public get transactionIds(): string[] {
        // TODO update block type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore

        return this.data.tx.map((tx) => prefix0x(tx));
    }
}
