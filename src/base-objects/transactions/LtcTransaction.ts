import { LTC_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { Managed } from "../../utils/managed";
import { UtxoTransaction } from "./UtxoTransaction";

@Managed()
export class LtcTransaction extends UtxoTransaction {
   // Btc specific transaction

   public get currencyName(): string {
      return LTC_NATIVE_TOKEN_NAME;
   }
}
