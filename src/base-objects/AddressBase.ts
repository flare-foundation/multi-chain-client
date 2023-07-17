import Web3 from "web3";
import { unPrefix0x } from "../utils/utils";
export abstract class AddressBase {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   protected privateData: string;

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

   /**
    * Return the well defined standardized address hash for address created by the string representation used at the constructor
    * @returns {string} The standardized address hash (32 bytes hex string without prefix 0x)
    */
   public abstract get stdHash(): string;

   /**
    * Returns the type of address
    */
   public abstract get type(): string;

   /**
    *Returns true if the address is valid on main
    */
   public abstract get isMainnet(): boolean;

   /**
    * Check if address has the correct format and satisfies checksum
    * Some chains support multiple types of addresses that have different address format definitions (ie X addresses and classic addresses)
    */
   public abstract isValid(): boolean;

   /**
    * Static method to convert a string to a standard hash
    * @param a 0x prefixed string to be hashed
    * @returns standardized un-prefixed keccak256 hash
    */
   protected static toStandardHash(a: string): string {
      return unPrefix0x(Web3.utils.keccak256(a));
   }
}

export { XrpAddress } from "./addressObjects/XrpAddress";
