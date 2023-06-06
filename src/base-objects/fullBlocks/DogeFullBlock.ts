import { IUtxoGetBlockRes } from "../../types";
import { Managed } from "../../utils/managed";
import { UtxoFullBlock } from "../BlockBase";
import { DogeTransaction } from "../TransactionBase";

// @Managed()
// export class DogeFullBlock extends UtxoBlock implements FullBlockBase<DogeTransaction> {
//    public get transactions(): DogeTransaction[] {
//       throw new Error("Method not implemented.");
//    }
// }

@Managed()
export class DogeFullBlock extends UtxoFullBlock<DogeTransaction> {
   constructor(data: IUtxoGetBlockRes) {
      super(data);
      // Must be implemented in specific chain class
      this.transactionConstructor = DogeTransaction;
   }
}
