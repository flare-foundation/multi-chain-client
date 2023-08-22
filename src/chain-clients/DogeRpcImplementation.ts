import { DogeBlock, DogeBlockHeader, DogeBlockTip, DogeFullBlock, DogeTransaction } from "../base-objects";
import { DogeRpcInterface, UtxoMccCreate } from "../types";
import { ChainType } from "../types/genericMccTypes";
import { UtxoCore } from "./UtxoCore";

export const dogeObjectConstructors = {
    transactionConstructor: DogeTransaction,
    fullBlockConstructor: DogeFullBlock,
    blockConstructor: DogeBlock,
    blockHeaderConstructor: DogeBlockHeader,
    blockTipConstructor: DogeBlockTip,
};
export class DOGEImplementation
    extends UtxoCore<DogeBlockTip, DogeBlockHeader, DogeBlock, DogeFullBlock, DogeTransaction>
    implements DogeRpcInterface<DogeBlockTip, DogeBlockHeader, DogeBlock, DogeFullBlock, DogeTransaction>
{
    constructor(options: UtxoMccCreate) {
        super(options, dogeObjectConstructors);
        this.chainType = ChainType.DOGE;
    }
}
