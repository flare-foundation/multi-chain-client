import { BTC_BASE_58_DICT_regex, btcBase58Checksum, btcBase58AddrToPkScript, btcBase58Decode, prefix0x } from "../../utils/utils";
import { AddressBase } from "../AddressBase";
import { UtxoAddressTypes } from "./AddressTypes";
import { UtxoAddress } from "./UtxoAddress";

export class DogeAddress extends UtxoAddress {
   get prefix(): string {
      return this.privateData[0];
   }

   public get type() {
      switch (this.prefix) {
         case "D":
            return UtxoAddressTypes.P2PKH;
         case "n":
            return UtxoAddressTypes.TEST_P2PKH;
         case "m":
            return UtxoAddressTypes.TEST_P2PKH;
         case "2":
            return UtxoAddressTypes.TEST_P2SH;
         case "A":
         case "9":
            return UtxoAddressTypes.P2SH;
         default:
            return UtxoAddressTypes.INVALID;
      }
   }

   public get stdHash(): string {
      if (!this.isValid()) throw new Error("invalid address");

      switch (this.type) {
         case UtxoAddressTypes.P2PKH:
         case UtxoAddressTypes.P2SH:
         case UtxoAddressTypes.TEST_P2PKH:
         case UtxoAddressTypes.TEST_P2SH:
            return AddressBase.toStandardHash(prefix0x(btcBase58Decode(this.privateData).toString("hex")));
         default:
            throw new Error("invalid address");
      }
   }

   public isValid(): boolean {
      switch (this.type) {
         case UtxoAddressTypes.P2PKH:
         case UtxoAddressTypes.P2SH:
         case UtxoAddressTypes.TEST_P2PKH:
         case UtxoAddressTypes.TEST_P2SH:
            //invalid length
            if (25 > this.privateData.length || this.privateData.length > 34) {
               return false;
            }
            if (BTC_BASE_58_DICT_regex.test(this.privateData)) return false; // contains invalid characters

            return btcBase58Checksum(this.privateData);

         default:
            return false;
      }
   }

   public addressToPkscript(): string {
      if (!this.isValid()) throw new Error("invalid address");
      switch (this.type) {
         case UtxoAddressTypes.P2PKH:
         case UtxoAddressTypes.P2SH:
         case UtxoAddressTypes.TEST_P2PKH:
         case UtxoAddressTypes.TEST_P2SH:
            return btcBase58AddrToPkScript(this.privateData);
         default:
            throw new Error("invalid address");
      }
   }
}
