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
