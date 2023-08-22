import { IUtxoGetBlockRes } from "../../types";
import { BtcTransaction } from "../transactions/BtcTransaction";
import { UtxoFullBlock } from "./UtxoFullBlock";

export class BtcFullBlock extends UtxoFullBlock<BtcTransaction> {
    constructor(data: IUtxoGetBlockRes) {
        super(data);
        // Must be implemented in specific chain class
        this.transactionConstructor = BtcTransaction;
    }
}
