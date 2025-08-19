import { BtcBlock, BtcBlockHeader, BtcBlockTip, BtcFullBlock, BtcTransaction } from "../base-objects";
import { UtxoMccCreate, UtxoRpcInterface } from "../types";
import { ChainType } from "../types/genericMccTypes";
import { UtxoCore, objectConstructors } from "./UtxoCore";

export const btcObjectConstructors: objectConstructors<
    BtcBlockTip,
    BtcBlockHeader,
    BtcBlock,
    BtcFullBlock,
    BtcTransaction
> = {
    transactionConstructor: BtcTransaction,
    fullBlockConstructor: BtcFullBlock,
    blockConstructor: BtcBlock,
    blockHeaderConstructor: BtcBlockHeader,
    blockTipConstructor: BtcBlockTip,
};

export class BTCImplementation
    extends UtxoCore<BtcBlockTip, BtcBlockHeader, BtcBlock, BtcFullBlock, BtcTransaction>
    implements UtxoRpcInterface<BtcBlockTip, BtcBlockHeader, BtcBlock, BtcFullBlock, BtcTransaction>
{
    constructor(options: UtxoMccCreate) {
        super(options, btcObjectConstructors);
        this.chainType = ChainType.BTC;
    }
}
