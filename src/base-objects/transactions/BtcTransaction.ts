import { BTC_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { Managed } from "../../utils/managed";
import { BtcAddress } from "../addressObjects/BtcAddress";
import { UtxoTransaction } from "./UtxoTransaction";

@Managed()
export class BtcTransaction extends UtxoTransaction {
   // Btc specific transaction

   public get currencyName(): string {
      return BTC_NATIVE_TOKEN_NAME;
   }

   public isValidPkscript(index: number): boolean {
      const vout = this.extractVoutAt(index);
      if (!vout.scriptPubKey.address) return true; //OP_RETURN
      const address = new BtcAddress(vout.scriptPubKey.address);
      return address.addressToPkscript() == vout.scriptPubKey.hex;
   }
}
