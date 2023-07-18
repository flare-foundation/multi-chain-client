import { AddressBase } from "../AddressBase";
import * as crypto from "crypto";
import base from "base-x";
import { bytesToHex } from "../../utils/algoUtils";
import { prefix0x, xrpBase58Decode } from "../../utils/utils";

export type XrpAddressTypeUnion = "classic" | "invalid";

export const R_B58_DICT = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz";
const base58 = base(R_B58_DICT);
const classicAddressRegex = /r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,35}/;

export class XrpAddress extends AddressBase {
   public get type(): XrpAddressTypeUnion {
      if (this.isValidClassicAddressFormat()) {
         return "classic";
      } else {
         return "invalid";
      }
   }

   public get stdHash(): string {
      const dec = prefix0x(bytesToHex(xrpBase58Decode(this.privateData)));
      return XrpAddress.toStandardHash(dec);
   }

   private isChecksumValid(): boolean {
      const dec = base58.decode(this.privateData);
      const c1 = crypto.createHash("sha256").update(dec.slice(0, -4)).digest();
      const c2 = crypto.createHash("sha256").update(c1).digest();
      const checksum_computed = c2.slice(0, 4);
      const checksum_read = dec.slice(-4);
      return checksum_computed.equals(checksum_read);
   }

   public isValid(): boolean {
      return this.isValidClassicAddressFormat() && this.isChecksumValid() && base58.decode(this.privateData).length == 25;
   }

   get isMainnet() {
      if (this.isValid() && this.privateData[0] == "r") return true;
      else return false;
   }

   private isValidClassicAddressFormat(): boolean {
      return classicAddressRegex.test(this.privateData);
   }

   // TODO: Add getters for special addresses (https://xrpl.org/accounts.html#special-addresses)
}
