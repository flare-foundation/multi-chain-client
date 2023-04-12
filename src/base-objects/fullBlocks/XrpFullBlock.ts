import { IXrpGetBlockRes } from "../../types";
import { Managed } from "../../utils/managed";
import { FullBlockBase, XrpBlock } from "../BlockBase";
import { XrpTransaction } from "../TransactionBase";

@Managed()
export class XrpFullBlock extends XrpBlock implements FullBlockBase<IXrpGetBlockRes, XrpTransaction> {
   public get transactions(): XrpTransaction[] {
      throw new Error("Method not implemented.");
   }
}
