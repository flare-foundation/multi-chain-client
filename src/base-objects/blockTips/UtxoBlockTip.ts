import { IUtxoChainTip, IUtxoChainTipStatuses } from "../../types";
import { BlockTipBase } from "../BlockBase";

export abstract class UtxoBlockTip extends BlockTipBase {
    public get data(): IUtxoChainTip {
        return this.privateData as IUtxoChainTip;
    }

    public get branchLen(): number {
        return this.data.branchlen;
    }

    public get number(): number {
        return this.data.height;
    }

    public get blockHash(): string {
        return this.data.hash;
    }

    public get stdBlockHash(): string {
        return this.blockHash;
    }

    public get chainTipStatus(): IUtxoChainTipStatuses {
        return this.data.status;
    }
}
