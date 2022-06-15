import { DOGE_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { GetTryCatchWrapper } from "../../utils/errors";
import { UtxoTransaction } from "./UtxoTransaction";

export class DogeTransaction extends UtxoTransaction {
   // Btc specific transaction
   @GetTryCatchWrapper()
   public get currencyName(): string {
      return DOGE_NATIVE_TOKEN_NAME;
   }
}
