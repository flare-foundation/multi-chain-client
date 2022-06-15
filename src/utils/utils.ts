import BN from "bn.js";
import Web3 from "web3";
import { MccLoggingOptions, MccLoggingOptionsFull } from "../types/genericMccTypes";
const camelCase = require("camelcase");

export const ZERO_BYTES_32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

export function MccError(error: any) {
   try {
      const message = JSON.stringify(error, null, 3);
      return new Error(message);
   } catch (thisError) {
      return new Error(`MCC stringify error ${thisError}`);
   }
}

export function getSimpleRandom(maxnum: number): number {
   return Math.floor(Math.random() * maxnum);
}

// export function ensure_nonempty(res: AxiosResponse){
//     if(res.status === 404){
//         return false
//     }
//     else {
//         return true
//     }
// }

export async function sleepMs(ms: number) {
   await new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function unPrefix0x(tx: string) {
   if (!tx) {
      //throw new Error( "unPrefix0x string null" );
      // console.error( `unPrefix0x null string`)
      return "0x0";
   }
   return tx.startsWith("0x") ? tx.slice(2) : tx;
}

export function prefix0x(tx: string) {
   if (!tx) {
      //throw new Error( "prefix0x string null" );
      // console.error( `prefix0x null string`)
      return "0x0";
   }
   return tx.startsWith("0x") ? tx : "0x" + tx;
}

export function toHex(x: string | number | BN) {
   return Web3.utils.toHex(x);
}

export function toBN(x: string | number | BN, toZeroIfFails = false) {
   if (x && x.constructor?.name === "BN") return x as BN;
   try {
      return Web3.utils.toBN(x as any);
   } catch (e) {
      if (toZeroIfFails) {
         return Web3.utils.toBN(0);
      }
      throw MccError(e);
   }
}

export function toNumber(x: number | BN | undefined | null) {
   if (x === undefined || x === null) return undefined;
   if (x && x.constructor?.name === "BN") return (x as BN).toNumber();
   return x as number;
}

export function toCamelCase(obj: object): object {
   let camelObject: any = {};
   for (let prop in obj) {
      if (typeof (obj as any)[prop] == "object") {
         camelObject[camelCase(prop)] = toCamelCase((obj as any)[prop]);
      } else {
         camelObject[camelCase(prop)] = (obj as any)[prop];
      }
   }
   return camelObject;
}

export function camelToSnakeCase(str: string, splitWith: string = "-") {
   return str.replace(/[A-Z]/g, (letter) => `${splitWith}${letter.toLowerCase()}`);
}

export function toSnakeCase(obj: object, splitWith: string = "-"): object {
   let camelObject: any = {};
   for (let prop in obj) {
      if (typeof (obj as any)[prop] == "object") {
         camelObject[camelToSnakeCase(camelCase(prop), splitWith)] = toSnakeCase((obj as any)[prop], splitWith);
      } else {
         camelObject[camelToSnakeCase(camelCase(prop), splitWith)] = (obj as any)[prop];
      }
   }
   return camelObject;
}

export function isValidBytes32Hex(address: string) {
   return /^0x[0-9a-fA-F]{64}$/i.test(address);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////// json stringify wrapper //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

export function mccJsonStringify(toStringify: any){
   return JSON.stringify(
      toStringify,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
   )
}



////////////////////////////////////////////////////////////////////////////////////////////////////
////////// Default logging and exception callbacks /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

export function defaultLoggingCallback(message: string): void {
   console.log(message);
}

export function defaultWarningCallback(message: string): void {
   console.log(message);
}

export function defaultExceptionCallback(error: any, message: string): void {
   console.log(message);
   console.error(error);
   if (error.stack) {
      console.error(error.stack);
   }
}

export function defaultMccLoggingObject(): MccLoggingOptionsFull {
   return {
      mode: "develop",
      loggingCallback: defaultLoggingCallback,
      warningCallback: defaultWarningCallback,
      exceptionCallback: defaultExceptionCallback,
   };
}

export function fillWithDefault(partialMccLogging: MccLoggingOptions): MccLoggingOptionsFull {
   return {
      mode: partialMccLogging.mode ? partialMccLogging.mode : "develop",
      loggingCallback: partialMccLogging.loggingCallback ? partialMccLogging.loggingCallback : defaultLoggingCallback,
      warningCallback: partialMccLogging.warningCallback ? partialMccLogging.warningCallback : defaultWarningCallback,
      exceptionCallback: partialMccLogging.exceptionCallback ? partialMccLogging.exceptionCallback : defaultExceptionCallback,
   };
}
