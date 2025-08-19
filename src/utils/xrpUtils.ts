import { AccountRootFlags, PosToFlag } from "../types";
import { XRP_UTD } from "./constants";
import { mccError, mccErrorCode } from "./errors";
import { MccError } from "./utils";
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const XrpAddress = require("ripple-address-codec");

////////////////////////////
//// MCC Error handling ////
////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function xrp_ensure_data(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.result.status === "error") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (data.result.error === "txnNotFound") {
            throw new mccError(mccErrorCode.InvalidTransaction);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (data.result.error === "lgrNotFound") {
            throw new mccError(mccErrorCode.InvalidBlock);
        }
        throw MccError(data);
    }

    if (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        data.result.status === "success" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        data.result.ledger &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (data.result.ledger.closed === false || data.result.validated === false)
    ) {
        throw new mccError(mccErrorCode.InvalidBlock); //the ledger is proposed but not closed yet
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return XrpAddress.decodeAccountID(address);
        } else {
            // it is a ripple x address
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const classic = XrpAddress.xAddressToClassicAddress(address);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return XrpAddress.decodeAccountID(classic.classicAddress);
        }
    }
    return Buffer.from([0x00]);
}

export function bytesToRippleAddress(byts: Buffer) {
    if (byts.length === 20) {
        // it is a valid address
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return XrpAddress.encodeAccountID(byts);
    }
    throw new Error("Not a valid ripple address");
}
