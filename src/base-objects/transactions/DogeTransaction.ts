import { DOGE_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { DogeAddress } from "../addressObjects/DogeAddress";
import { UtxoTransaction } from "./UtxoTransaction";

export class DogeTransaction extends UtxoTransaction {
   public isValidPkscript(index: number): boolean {
      const vout = this.extractVoutAt(index);
      if (!vout.scriptPubKey.address) return true; //OP_RETURN
      const address = new DogeAddress(vout.scriptPubKey.address);
      return address.addressToPkscript() == vout.scriptPubKey.hex;
   }

   public get currencyName(): string {
      return DOGE_NATIVE_TOKEN_NAME;
   }
}
