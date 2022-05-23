import { AccountRootFlags, HexToFlag } from "../types";
import { XRP_UTD } from "./constants";
import { MccError } from "./utils";

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
