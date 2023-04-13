import { IUtxoGetBlockRes } from "../../types";
import { Managed } from "../../utils/managed";
import { BtcTransaction } from "../TransactionBase";
import { UtxoFullBlock } from "./UtxoFullBlock";

@Managed()
export class BtcFullBlock extends UtxoFullBlock<BtcTransaction> {
   constructor(data: IUtxoGetBlockRes) {
      super(data);
      // Must be implemented in specific chain class
      this.transactionConstructor = BtcTransaction;
   }
}
