import { IUtxoGetBlockRes } from "../../types";
import { DogeTransaction } from "../transactions/DogeTransaction";
import { UtxoFullBlock } from "./UtxoFullBlock";
// @Managed()
// export class DogeFullBlock extends UtxoBlock implements FullBlockBase<DogeTransaction> {
//    public get transactions(): DogeTransaction[] {
//       throw new Error("Method not implemented.");
//    }
// }

export class DogeFullBlock extends UtxoFullBlock<DogeTransaction> {
   constructor(data: IUtxoGetBlockRes) {
      super(data);
      // Must be implemented in specific chain class
      this.transactionConstructor = DogeTransaction;
   }
}
