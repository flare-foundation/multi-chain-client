import { IUtxoGetBlockRes } from "../../types";
import { LtcTransaction } from "../TransactionBase";
import { UtxoFullBlock } from "./UtxoFullBlock";

export class LtcFullBlock extends UtxoFullBlock<LtcTransaction> {
   constructor(data: IUtxoGetBlockRes) {
      super(data);
      // Must be implemented in specific chain class
      this.transactionConstructor = LtcTransaction;
   }
}
