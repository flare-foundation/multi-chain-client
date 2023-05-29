export abstract class AddressBase {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   protected privateData: any;

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   constructor(data: string) {
      this.privateData = data;
   }

   /**
    * Exposing the private data for the derived classes (dev only/python like privatization)
    */
   public get _data() {
      return this.privateData;
   }

   public abstract get stdHash(): string;

   public abstract get type(): string;

   public abstract isChecksumValid(): boolean;

   /**
    * Check if address has the correct format
    * Some chains support multiple types of addresses that have different address format definitions (ie X addresses and classic addresses)
    */
   public abstract isValidFormat(): boolean;
}

export { XrpAddress } from "./addressObjects/XrpAddress";
