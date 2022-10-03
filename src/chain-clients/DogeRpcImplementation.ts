import { DogeBlock, DogeBlockHeader, DogeBlockTip } from "../base-objects/BlockBase";
import { DogeTransaction } from "../base-objects/TransactionBase";
import { ChainType, DogeRpcInterface, UtxoMccCreate } from "../types";
import { Managed } from "../utils/managed";
import { UtxoCore } from "./UtxoCore";

@Managed()
export class DOGEImplementation extends UtxoCore implements DogeRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options);
      this.chainType = ChainType.DOGE;
      this.transactionConstructor = DogeTransaction;
      this.blockConstructor = DogeBlock;
      this.blockHeaderConstructor = DogeBlockHeader;
      this.blockTipConstructor = DogeBlockTip;
   }
}
