import { AccountRootFlags, allHexFlags, HexToFlag, PosToFlag } from "../types";
import { XRP_UTD } from "./constants";
import { MccError } from "./utils";
const XrpAddress = require("ripple-address-codec");

////////////////////////////
//// MCC Error handling ////
////////////////////////////

export function xrp_ensure_data(data: any) {
   if (data.result.status === "error") {
      throw MccError(data);
   }
}

export function rippleTimeToUnixEpoch(timestamp: number) {
   return timestamp + XRP_UTD;
}

export function unixEpochToRippleTime(timestamp: number) {
   return timestamp - XRP_UTD;
}

export function processFlags(flag: number): AccountRootFlags[] {
   let altFlags: AccountRootFlags[] = [];
   const flagPos = [16, 17, 18, 19, 20, 21, 22, 23, 24];
   for (let posFlag of flagPos) {
      if ((flag >> posFlag) % 2 === 1) {
         // @ts-ignore
         altFlags.push(PosToFlag[posFlag]);
      }
   }
   return altFlags;
}

export function processFlagsOld1(flag: number): AccountRootFlags[] {
   const binFlag = flag.toString(2).padStart(8 * 4, "0");
   let altFlags: AccountRootFlags[] = [];
   for (let posFlag of allHexFlags) {
      const posFlagBin = posFlag.toString(2).padStart(8 * 4, "0");
      if ((flag ^ posFlag).toString(2).padStart(8 * 4, "0")[posFlagBin.indexOf("1")] === "0") {
         // @ts-ignore
         altFlags.push(HexToFlag[posFlag]);
      }
   }
   return altFlags;
}

export function processFlagsOld2(flag: number): AccountRootFlags[] {
   const hexFlag = "0x" + flag.toString(16).padStart(8, "0");
   let Flags: AccountRootFlags[] = [];
   switch (hexFlag[5]) {
      case "f": // 15
         Flags.push(HexToFlag[0x00010000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00020000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00040000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00080000] as AccountRootFlags);
         break;
      case "e": // 14
         Flags.push(HexToFlag[0x00020000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00040000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00080000] as AccountRootFlags);
         break;
      case "d": // 13
         Flags.push(HexToFlag[0x00010000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00040000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00080000] as AccountRootFlags);
         break;
      case "c": // 12
         Flags.push(HexToFlag[0x00040000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00080000] as AccountRootFlags);
         break;
      case "b": // 11
         Flags.push(HexToFlag[0x00010000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00020000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00080000] as AccountRootFlags);
         break;
      case "a": // 10
         Flags.push(HexToFlag[0x00020000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00080000] as AccountRootFlags);
         break;
      case "9":
         Flags.push(HexToFlag[0x00010000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00080000] as AccountRootFlags);
         break;
      case "8":
         Flags.push(HexToFlag[0x00080000] as AccountRootFlags);
         break;
      case "7":
         Flags.push(HexToFlag[0x00010000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00020000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00040000] as AccountRootFlags);
         break;
      case "6":
         Flags.push(HexToFlag[0x00020000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00040000] as AccountRootFlags);
         break;
      case "5":
         Flags.push(HexToFlag[0x00010000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00040000] as AccountRootFlags);
         break;
      case "4":
         Flags.push(HexToFlag[0x00040000] as AccountRootFlags);
         break;
      case "3":
         Flags.push(HexToFlag[0x00010000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00020000] as AccountRootFlags);
         break;
      case "2":
         Flags.push(HexToFlag[0x00020000] as AccountRootFlags);
         break;
      case "1":
         Flags.push(HexToFlag[0x00010000] as AccountRootFlags);
         break;
   }
   switch (hexFlag[4]) {
      case "f": // 15
         Flags.push(HexToFlag[0x00100000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00200000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00400000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00800000] as AccountRootFlags);
         break;
      case "e": // 14
         Flags.push(HexToFlag[0x00200000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00400000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00800000] as AccountRootFlags);
         break;
      case "d": // 13
         Flags.push(HexToFlag[0x00100000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00400000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00800000] as AccountRootFlags);
         break;
      case "c": // 12
         Flags.push(HexToFlag[0x00400000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00800000] as AccountRootFlags);
         break;
      case "b": // 11
         Flags.push(HexToFlag[0x00100000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00200000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00800000] as AccountRootFlags);
         break;
      case "a": // 10
         Flags.push(HexToFlag[0x00200000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00800000] as AccountRootFlags);
         break;
      case "9":
         Flags.push(HexToFlag[0x00100000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00800000] as AccountRootFlags);
         break;
      case "8":
         Flags.push(HexToFlag[0x00800000] as AccountRootFlags);
         break;
      case "7":
         Flags.push(HexToFlag[0x00100000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00200000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00400000] as AccountRootFlags);
         break;
      case "6":
         Flags.push(HexToFlag[0x00200000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00400000] as AccountRootFlags);
         break;
      case "5":
         Flags.push(HexToFlag[0x00100000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00400000] as AccountRootFlags);
         break;
      case "4":
         Flags.push(HexToFlag[0x00400000] as AccountRootFlags);
         break;
      case "3":
         Flags.push(HexToFlag[0x00100000] as AccountRootFlags);
         Flags.push(HexToFlag[0x00200000] as AccountRootFlags);
         break;
      case "2":
         Flags.push(HexToFlag[0x00200000] as AccountRootFlags);
         break;
      case "1":
         Flags.push(HexToFlag[0x00100000] as AccountRootFlags);
         break;
   }
   switch (hexFlag[3]) {
      case "1":
         Flags.push(HexToFlag[0x01000000] as AccountRootFlags);
         break;
   }
   return Flags;
}

///////////////////////////
// Xrp address <-> Bytes //
///////////////////////////

export function rippleAddressToBytes(address: string) {
   if (address.length > 0) {
      if (address[0] === "r") {
         return XrpAddress.decodeAccountID(address);
      } else {
         // it is a ripple x address
         const classic = XrpAddress.xAddressToClassicAddress(address);
         return XrpAddress.decodeAccountID(classic.classicAddress);
      }
   }
   return Buffer.from([0x00]);
}

export function bytesToRippleAddress(byts: Buffer) {
   if (byts.length === 20) {
      // it is a valid address
      return XrpAddress.encodeAccountID(byts);
   }
   throw new Error("Not a valid ripple address");
}
