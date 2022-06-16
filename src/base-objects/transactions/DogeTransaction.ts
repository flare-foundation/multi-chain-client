import { DOGE_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { Managed } from "../../utils/managed";
import { UtxoTransaction } from "./UtxoTransaction";

@Managed()
export class DogeTransaction extends UtxoTransaction {
   // Btc specific transaction

   public get currencyName(): string {
      return DOGE_NATIVE_TOKEN_NAME;
   }
}
