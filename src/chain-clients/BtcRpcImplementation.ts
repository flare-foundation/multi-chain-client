import { BtcBlock } from "../base-objects/BlockBase";
import { BtcTransaction } from "../base-objects/transactions/BtcTransaction";
import { ChainType, UtxoMccCreate, UtxoRpcInterface } from "../types";
import { UtxoCore } from "./UtxoCore";

export class BTCImplementation extends UtxoCore implements UtxoRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options);
      this.chainType = ChainType.BTC;
      this.transactionConstructor = BtcTransaction;
      this.blockConstructor = BtcBlock;
   }
}
