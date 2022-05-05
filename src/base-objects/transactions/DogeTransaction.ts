import { DOGE_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { UtxoTransaction } from "./UtxoTransaction";

export class DogeTransaction extends UtxoTransaction {
   // Btc specific transaction
   public get currencyName(): string {
      return DOGE_NATIVE_TOKEN_NAME;
   }
}
