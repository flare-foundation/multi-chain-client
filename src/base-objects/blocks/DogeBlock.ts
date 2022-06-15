import { GetTryCatchWrapper } from "../../utils/errors";
import { prefix0x } from "../../utils/utils";
import { UtxoBlock } from "./UtxoBlock";

export class DogeBlock extends UtxoBlock {
   @GetTryCatchWrapper()
   public get transactionHashes(): string[] {
      // TODO update block type
      // @ts-ignore
      return this.data.tx!.map((tx) => prefix0x(tx));
   }
}
