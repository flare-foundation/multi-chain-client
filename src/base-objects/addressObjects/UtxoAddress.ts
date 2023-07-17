import { AddressBase } from "../AddressBase";
import { UtxoAddressTypes } from "./AddressTypes";

export abstract class UtxoAddress extends AddressBase {
   public get stdHash(): string {
      throw new Error("Method not implemented.");
   }
   public get type(): UtxoAddressTypes {
      throw new Error("Method not implemented.");
   }

   abstract get prefix(): string;

   public addressToPkscript(): string {
      throw new Error("Method not implemented.");
   }
   public isValid(): boolean {
      throw new Error("Method not implemented.");
   }

   get isMainnet() {
      if (!this.isValid) return false;
      switch (this.type) {
         case UtxoAddressTypes.P2PKH:
         case UtxoAddressTypes.P2SH:
         case UtxoAddressTypes.P2WPKH:
         case UtxoAddressTypes.P2WSH:
         case UtxoAddressTypes.P2TR:
            return true;
         default:
            return false;
      }
   }
}
