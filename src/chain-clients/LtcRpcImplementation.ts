import { LtcBlock, LtcBlockHeader, LtcBlockTip } from "../base-objects/BlockBase";
import { LtcTransaction } from "../base-objects/TransactionBase";
import { ChainType, UtxoMccCreate, UtxoRpcInterface } from "../types";
import { Managed } from "../utils/managed";
import { UtxoCore } from "./UtxoCore";

@Managed()
export class LTCImplementation extends UtxoCore implements UtxoRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options);
      this.chainType = ChainType.LTC;
      this.transactionConstructor = LtcTransaction;
      this.blockConstructor = LtcBlock;
      this.blockHeaderConstructor = LtcBlockHeader;
      this.blockTipConstructor = LtcBlockTip;
   }
}
