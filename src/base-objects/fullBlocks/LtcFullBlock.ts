import { IUtxoGetBlockRes } from "../../types";
import { Managed } from "../../utils/managed";
import { LtcTransaction } from "../TransactionBase";
import { UtxoFullBlock } from "./UtxoFullBlock";

@Managed()
export class LtcFullBlock extends UtxoFullBlock<LtcTransaction> {
   constructor(data: IUtxoGetBlockRes) {
      super(data);
      // Must be implemented in specific chain class
      this.transactionConstructor = LtcTransaction;
   }
}
