import { AddressBase } from "../AddressBase";

export class UtxoAddress extends AddressBase {
   public get stdHash(): string {
      throw new Error("Method not implemented.");
   }
   public get type(): string {
      throw new Error("Method not implemented.");
   }
   public isChecksumValid(): boolean {
      throw new Error("Method not implemented.");
   }
   public isValidFormat(): boolean {
      throw new Error("Method not implemented.");
   }
}
