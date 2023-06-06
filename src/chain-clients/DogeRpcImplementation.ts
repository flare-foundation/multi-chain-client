import { DogeBlock, DogeBlockHeader, DogeBlockTip, DogeFullBlock, DogeTransaction } from "../base-objects";
import { ChainType, DogeRpcInterface, UtxoMccCreate } from "../types";
import { UtxoCore } from "./UtxoCore";

export const dogeObjectConstructors = {
   transactionConstructor: DogeTransaction,
   fullBlockConstructor: DogeFullBlock,
   blockConstructor: DogeBlock,
   blockHeaderConstructor: DogeBlockHeader,
   blockTipConstructor: DogeBlockTip,
};
export class DOGEImplementation extends UtxoCore<DogeTransaction, DogeFullBlock, DogeBlock, DogeBlockHeader, DogeBlockTip> implements DogeRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options, dogeObjectConstructors);
      this.chainType = ChainType.DOGE;
   }
}
