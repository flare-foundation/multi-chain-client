import { Managed } from "../../utils/managed";
import { prefix0x } from "../../utils/utils";
import { UtxoBlock } from "./UtxoBlock";

@Managed()
export class DogeBlock extends UtxoBlock {
   public get transactionHashes(): string[] {
      // TODO update block type
      // @ts-ignore
      return this.data.tx!.map((tx) => prefix0x(tx));
   }
}
