import { BtcBlock, BtcBlockHeader, BtcBlockTip } from "../base-objects/BlockBase";
import { BtcTransaction } from "../base-objects/transactions/BtcTransaction";
import { ChainType, UtxoMccCreate, UtxoRpcInterface } from "../types";
import { Managed } from "../utils/managed";
import { UtxoCore } from "./UtxoCore";

@Managed()
export class BTCImplementation extends UtxoCore implements UtxoRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options);
      this.chainType = ChainType.BTC;
      this.transactionConstructor = BtcTransaction;
      this.blockConstructor = BtcBlock;
      this.blockHeaderConstructor = BtcBlockHeader;
      this.blockTipConstructor = BtcBlockTip;
   }
}
