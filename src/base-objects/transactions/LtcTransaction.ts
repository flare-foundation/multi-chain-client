import { LTC_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { UtxoTransaction } from "./UtxoTransaction";

export class LtcTransaction extends UtxoTransaction {
   public isValidPkscript(voutIndex: number): boolean {
      return true;
   }
   // Btc specific transaction

   public get currencyName(): string {
      return LTC_NATIVE_TOKEN_NAME;
   }
}
