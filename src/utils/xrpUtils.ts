import { AccountRootFlags, PosToFlag } from "../types";
import { XRP_UTD } from "./constants";
import { mccError, mccErrorCode } from "./errors";
import { MccError } from "./utils";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const XrpAddress = require("ripple-address-codec");

////////////////////////////
//// MCC Error handling ////
////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function xrp_ensure_data(data: any) {
    if (data.result.status === "error") {
        if (data.result.error === "txnNotFound") {
            throw new mccError(mccErrorCode.InvalidTransaction);
        }
        if (data.result.error === "lgrNotFound") {
            throw new mccError(mccErrorCode.InvalidBlock);
        }
        throw MccError(data);
    }
    if (data.result.status === "success" && data.result.ledger && data.result.closed === false) {
        throw new mccError(mccErrorCode.InvalidBlock);
    }
}

export function rippleTimeToUnixEpoch(timestamp: number) {
    return timestamp + XRP_UTD;
}

export function unixEpochToRippleTime(timestamp: number) {
    return timestamp - XRP_UTD;
}

export function processFlags(flag: number): AccountRootFlags[] {
    const altFlags: AccountRootFlags[] = [];
    const flagPos = [16, 17, 18, 19, 20, 21, 22, 23, 24];
    for (const posFlag of flagPos) {
        if ((flag >> posFlag) % 2 === 1) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            altFlags.push(PosToFlag[posFlag]);
        }
    }
    return altFlags;
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
