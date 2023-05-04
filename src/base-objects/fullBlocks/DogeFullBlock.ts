import { IUtxoGetBlockRes } from "../../types";
import { Managed } from "../../utils/managed";
import { FullBlockBase, UtxoBlock, UtxoFullBlock } from "../BlockBase";
import { DogeTransaction } from "../TransactionBase";

@Managed()
export class DogeFullBlock extends UtxoBlock implements FullBlockBase<IUtxoGetBlockRes, DogeTransaction> {
   public get transactions(): DogeTransaction[] {
      throw new Error("Method not implemented.");
   }
}
