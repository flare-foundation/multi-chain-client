import { LtcBlock, LtcBlockHeader, LtcBlockTip, LtcFullBlock, LtcTransaction } from "../base-objects";
import { ChainType, UtxoMccCreate, UtxoRpcInterface } from "../types";
import { UtxoCore } from "./UtxoCore";

export const ltcObjectConstructors = {
   transactionConstructor: LtcTransaction,
   fullBlockConstructor: LtcFullBlock,
   blockConstructor: LtcBlock,
   blockHeaderConstructor: LtcBlockHeader,
   blockTipConstructor: LtcBlockTip,
};

export class LTCImplementation extends UtxoCore<LtcTransaction, LtcFullBlock, LtcBlock, LtcBlockHeader, LtcBlockTip> implements UtxoRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options, ltcObjectConstructors);
      this.chainType = ChainType.LTC;
   }
}
