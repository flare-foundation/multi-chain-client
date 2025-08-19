/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextDecoder } from "util";
import { toHex as W3ToHex, keccak256, padLeft } from "web3-utils";
import { MccLoggingOptions, MccLoggingOptionsFull } from "../types/genericMccTypes";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const safeStringify = require("fast-safe-stringify");

export const ZERO_BYTES_32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

export function MccError(error: any) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const message = mccJsonStringify(error);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return new Error(message);
    } catch (thisError) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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

export function toHex(x: string | number): string {
    return W3ToHex(Number(x));
}

// Convert a hex string to a byte array (???ALGO SPECIFIC???)
export function hexToBytes(hex: string): Uint8Array {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
}

export function toHex32Bytes(x: string | number): string {
    return padLeft(toHex(x), 64);
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.stack) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        exceptionCallback: partialMccLogging.exceptionCallback
            ? partialMccLogging.exceptionCallback
            : defaultExceptionCallback,
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////// Standard address Hash ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

export function standardAddressHash(address: string): string {
    return keccak256(address);
}
