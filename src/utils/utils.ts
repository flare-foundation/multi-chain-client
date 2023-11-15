/* eslint-disable @typescript-eslint/no-explicit-any */
import BN from "bn.js";
import Web3 from "web3";
import { MccLoggingOptions, MccLoggingOptionsFull } from "../types/genericMccTypes";
import { TextDecoder } from "util";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const safeStringify = require("fast-safe-stringify");

export const ZERO_BYTES_32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

export function MccError(error: any) {
    try {
        const message = mccJsonStringify(error);
        return new Error(message);
    } catch (thisError) {
        return new Error(`MCC stringify error ${thisError}`);
    }
}

export function getSimpleRandom(maxnum: number): number {
    return Math.floor(Math.random() * maxnum);
}

export async function sleepMs(ms: number) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function unPrefix0x(tx: string) {
    if (!tx) {
        return "0x0";
    }
    return tx.startsWith("0x") ? tx.slice(2) : tx;
}

export function prefix0x(tx: string) {
    if (!tx) {
        return "0x0";
    }
    return tx.startsWith("0x") ? tx : "0x" + tx;
}

export function isPrefixed0x(tx: string) {
    if (!tx) {
        return false;
    }
    return tx.startsWith("0x") ? true : false;
}

export function toHex(x: string | number | BN): string {
    return Web3.utils.toHex(x);
}

// Convert a hex string to a byte array (???ALGO SPECIFIC???)
export function hexToBytes(hex: string): Uint8Array {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
}

export function toHex32Bytes(x: string | number | BN): string {
    return Web3.utils.padLeft(toHex(x), 64);
}

export function toBN(x: string | number | BN, toZeroIfFails = false) {
    if (x && x.constructor && x.constructor.name === "BN") return x as BN;
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
    if (x && x.constructor && x.constructor.name === "BN") return (x as BN).toNumber();
    return x as number;
}

export function isValidBytes32Hex(address: string) {
    return /^(0x|0X)?[0-9a-fA-F]{64}$/i.test(address);
}

export function isValidBytes32HexPrefix(address: string) {
    return /^(0x|0X)?[0-9a-fA-F]{64}$/i.test(address);
}

export function isValidHexString(maybeHexString: string) {
    return /^(0x|0X)?[0-9a-fA-F]*$/i.test(maybeHexString);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////// bytes to string (utf8) decoder //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const decoder = new TextDecoder("UTF-8");

// Bytes as hex string to string
export function bytesAsHexToString(bytesString: string) {
    if (isValidHexString(bytesString)) {
        const array = new Uint8Array(hexToBytes(unPrefix0x(bytesString)));
        return prefix0x(decoder.decode(array));
    }
    return "";
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////// json stringify wrapper //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

export function mccJsonStringify(toStringify: any) {
    const options = {
        depthLimit: 2,
        edgesLimit: 3,
    };

    return safeStringify(toStringify, null, 2, options);
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

////////////////////////////////////////////////////////////////////////////////////////////////////
////////// Standard address Hash ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

export function standardAddressHash(address: string): string {
    return Web3.utils.keccak256(address);
}
