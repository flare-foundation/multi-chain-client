import { LtcBlock } from "../base-objects/BlockBase";
import { LtcTransaction } from "../base-objects/TransactionBase";
import { ChainType, UtxoMccCreate, UtxoRpcInterface } from "../types";
import { UtxoCore } from "./UtxoCore";

export class LTCImplementation extends UtxoCore implements UtxoRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options);
      this.chainType = ChainType.LTC;
      this.transactionConstructor = LtcTransaction;
      this.blockConstructor = LtcBlock;
   }
}
