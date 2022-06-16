import { BTC_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { UtxoTransaction } from "./UtxoTransaction";

export class BtcTransaction extends UtxoTransaction {
   // Btc specific transaction

   public get currencyName(): string {
      return BTC_NATIVE_TOKEN_NAME;
   }
}
