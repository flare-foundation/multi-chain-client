import { BTC_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { GetTryCatchWrapper } from "../../utils/errors";
import { UtxoTransaction } from "./UtxoTransaction";

export class BtcTransaction extends UtxoTransaction {
   // Btc specific transaction
   @GetTryCatchWrapper()
   public get currencyName(): string {
      return BTC_NATIVE_TOKEN_NAME;
   }
}
