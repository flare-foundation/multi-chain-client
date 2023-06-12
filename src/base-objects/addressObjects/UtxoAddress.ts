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
}
