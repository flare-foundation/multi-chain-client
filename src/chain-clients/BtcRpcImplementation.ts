import { BtcBlock, BtcBlockHeader, BtcBlockTip, BtcFullBlock } from "../base-objects/BlockBase";
import { BtcTransaction } from "../base-objects/transactions/BtcTransaction";
import { ChainType, UtxoMccCreate, UtxoRpcInterface } from "../types";
import { Managed } from "../utils/managed";
import { UtxoCore } from "./UtxoCore";

export const btcObjectConstructors = {
   transactionConstructor: BtcTransaction,
   fullBlockConstructor: BtcFullBlock,
   blockConstructor: BtcBlock,
   blockHeaderConstructor: BtcBlockHeader,
   blockTipConstructor: BtcBlockTip,
};

@Managed()
export class BTCImplementation extends UtxoCore<BtcTransaction, BtcFullBlock, BtcBlock, BtcBlockHeader, BtcBlockTip> implements UtxoRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options, btcObjectConstructors);
      this.chainType = ChainType.BTC;
   }
}
