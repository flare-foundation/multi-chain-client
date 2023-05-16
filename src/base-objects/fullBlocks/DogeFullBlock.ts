import { Managed } from "../../utils/managed";
import { FullBlockBase, UtxoBlock } from "../BlockBase";
import { DogeTransaction } from "../TransactionBase";

@Managed()
export class DogeFullBlock extends UtxoBlock implements FullBlockBase<DogeTransaction> {
   public get transactions(): DogeTransaction[] {
      throw new Error("Method not implemented.");
   }
}
