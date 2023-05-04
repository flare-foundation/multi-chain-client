import { DogeBlock, DogeBlockHeader, DogeBlockTip, DogeFullBlock } from "../base-objects/BlockBase";
import { DogeTransaction } from "../base-objects/TransactionBase";
import { ChainType, DogeRpcInterface, UtxoMccCreate } from "../types";
import { Managed } from "../utils/managed";
import { UtxoCore } from "./UtxoCore";

export const dogeObjectConstructors = {
   transactionConstructor: DogeTransaction,
   fullBlockConstructor: DogeFullBlock,
   blockConstructor: DogeBlock,
   blockHeaderConstructor: DogeBlockHeader,
   blockTipConstructor: DogeBlockTip,
};
@Managed()
export class DOGEImplementation extends UtxoCore<DogeTransaction, DogeFullBlock, DogeBlock, DogeBlockHeader, DogeBlockTip> implements DogeRpcInterface {
   constructor(options: UtxoMccCreate) {
      super(options, dogeObjectConstructors);
      this.chainType = ChainType.DOGE;
   }
}
