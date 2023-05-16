import { LtcBlock, LtcBlockHeader, LtcBlockTip, LtcFullBlock } from "../base-objects/BlockBase";
import { LtcTransaction } from "../base-objects/TransactionBase";
import { ChainType, UtxoMccCreate, UtxoRpcInterface } from "../types";
import { Managed } from "../utils/managed";
import { UtxoCore } from "./UtxoCore";

export const ltcObjectConstructors = {
   transactionConstructor: LtcTransaction,
   fullBlockConstructor: LtcFullBlock,
   blockConstructor: LtcBlock,
   blockHeaderConstructor: LtcBlockHeader,
   blockTipConstructor: LtcBlockTip,
};

@Managed()
export class LTCImplementation extends UtxoCore<LtcTransaction, LtcFullBlock, LtcBlock, LtcBlockHeader, LtcBlockTip> implements UtxoRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options, ltcObjectConstructors);
      this.chainType = ChainType.LTC;
   }
}
