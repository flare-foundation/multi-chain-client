import { IUtxoGetBlockRes } from "../../types";
import { Managed } from "../../utils/managed";
import { DogeBlock, FullBlockBase } from "../BlockBase";
import { DogeTransaction } from "../TransactionBase";

@Managed()
export class DogeFullBlock extends DogeBlock implements FullBlockBase<IUtxoGetBlockRes, DogeTransaction> {
   public get transactions(): DogeTransaction[] {
      throw new Error("Method not implemented.");
   }
}
