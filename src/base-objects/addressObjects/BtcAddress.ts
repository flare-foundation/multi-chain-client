import { bech32AddressToHex2, bech32AddressToPkscript, bech32Decode, bech32_decode } from "../../utils/bech32";
import { mccError, mccErrorCode } from "../../utils/errors";
import { BTC_BASE_58_DICT_regex, base58Checksum, btcBase58AddrToPkScript, btcBase58Decode } from "../../utils/utils";
import { UtxoAddressTypes } from "./AddressTypes";
import { UtxoAddress } from "./UtxoAddress";
import { AddressBase } from "./AddressBase";

export class BtcAddress extends UtxoAddress {
   get prefix(): string {
      const prefix = this.privateData[0].toLocaleLowerCase();
      switch (prefix) {
         case "1":
         case "2":
         case "3":
         case "n":
         case "m":
            return prefix;
         case "b":
            if (this.privateData.slice(0, 3).toLocaleLowerCase() == "bc1") {
               return "bc1";
            }
            throw new mccError(mccErrorCode.InvalidParameter, Error("invalid prefix"));
         case "t":
            if (this.privateData.slice(0, 3).toLocaleLowerCase() == "tb1") {
               return "tb1";
            }
            throw new mccError(mccErrorCode.InvalidParameter, Error("invalid prefix"));
         default:
            throw new mccError(mccErrorCode.InvalidParameter, Error("invalid prefix"));
      }
   }

   public get type() {
      switch (this.prefix) {
         case "1":
            return UtxoAddressTypes.P2PKH;
         case "n":
         case "m":
            return UtxoAddressTypes.TEST_P2PKH;
         case "2":
            return UtxoAddressTypes.TEST_P2SH;
         case "3":
            return UtxoAddressTypes.P2SH;
         case "bc1":
            const version = bech32Decode(this.privateData)?.version;
            if (version == undefined) {
               return UtxoAddressTypes.INVALID;
            }
            if (version == 0) {
               if (this.privateData.length == 42) return UtxoAddressTypes.P2WPKH;
               else if (this.privateData.length == 62) return UtxoAddressTypes.P2WSH;
               else throw new mccError(mccErrorCode.InvalidParameter, Error("invalid address length"));
            } else if (version == 1) {
               return UtxoAddressTypes.P2TR;
            } else if (version < 17) {
               return UtxoAddressTypes.HIGHER_VERSION;
            } else return UtxoAddressTypes.INVALID;
         case "tb1":
            const versionT = bech32Decode(this.privateData)?.version;
            if (versionT == undefined) {
               return UtxoAddressTypes.INVALID;
            }
            if (versionT == 0) {
               if (this.privateData.length == 42) return UtxoAddressTypes.TEST_P2WPKH;
               else if (this.privateData.length == 62) return UtxoAddressTypes.TEST_P2WSH;
               else throw new mccError(mccErrorCode.InvalidParameter, Error("invalid address length"));
            } else if (versionT == 1) {
               return UtxoAddressTypes.TEST_P2TR;
            } else if (versionT < 17) {
               return UtxoAddressTypes.TEST_HIGHER_VERSION;
            } else return UtxoAddressTypes.INVALID;
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
            return AddressBase.toStandardHash(btcBase58Decode(this.privateData).toString("hex"));
         case UtxoAddressTypes.P2WPKH:
         case UtxoAddressTypes.P2WSH:
         case UtxoAddressTypes.P2TR:
         case UtxoAddressTypes.HIGHER_VERSION:
         case UtxoAddressTypes.TEST_HIGHER_VERSION:
         case UtxoAddressTypes.TEST_P2WPKH:
         case UtxoAddressTypes.TEST_P2WSH:
         case UtxoAddressTypes.TEST_P2TR:
            const addressHex = bech32AddressToHex2(this.privateData);
            if (addressHex) return AddressBase.toStandardHash(addressHex);
            throw new Error("invalid address");
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

            // checksum
            return base58Checksum(this.privateData);
         case UtxoAddressTypes.P2WPKH:
         case UtxoAddressTypes.P2WSH:
         case UtxoAddressTypes.TEST_P2WPKH:
         case UtxoAddressTypes.TEST_P2WSH:
            if (bech32_decode(this.privateData, "bech32")) return true;
            else return false;
         case UtxoAddressTypes.P2TR:
         case UtxoAddressTypes.TEST_P2TR:
         case UtxoAddressTypes.HIGHER_VERSION:
         case UtxoAddressTypes.TEST_HIGHER_VERSION:
            if (bech32_decode(this.privateData, "bech32m")) return true;
            else return false;
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
         case UtxoAddressTypes.P2WPKH:
         case UtxoAddressTypes.P2WSH:
         case UtxoAddressTypes.P2TR:
         case UtxoAddressTypes.HIGHER_VERSION:
         case UtxoAddressTypes.TEST_HIGHER_VERSION:
         case UtxoAddressTypes.TEST_P2WPKH:
         case UtxoAddressTypes.TEST_P2WSH:
         case UtxoAddressTypes.TEST_P2TR:
            return bech32AddressToPkscript(this.privateData);
         default:
            throw new Error("invalid address");
      }
   }
}
