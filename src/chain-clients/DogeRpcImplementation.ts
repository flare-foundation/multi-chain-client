import { DogeBlock } from "../base-objects/BlockBase";
import { DogeTransaction } from "../base-objects/TransactionBase";
import { ChainType, DogeRpcInterface, UtxoMccCreate } from "../types";
import { UtxoCore } from "./UtxoCore";

export class DOGEImplementation extends UtxoCore implements DogeRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options);
      this.chainType = ChainType.DOGE;
      this.transactionConstructor = DogeTransaction;
      this.blockConstructor = DogeBlock;
   }
}
