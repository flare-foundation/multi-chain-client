import { IAlgoTransaction } from "../types";
import { IAlgoHexAddress } from "../types/algoTypes";
import { MccError, prefix0x, unPrefix0x } from "./utils";
const base32 = require("base32.js");
const { default: algosdk } = require("algosdk");
const crypto = require("crypto");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// Errors //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const INVALIDADDRESERROR = (address: string) => {
   return new Error(`Invalid address: ${address}`);
};
export const INVALIDPUBKEYPAIRERROR = (algoKeyPair: IAlgoHexAddress) => {
   return new Error(`Invalid keypair: ${algoKeyPair.publicKey} -  ${algoKeyPair.checksum}`);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// Code ////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function filterHashes(trans: IAlgoTransaction) {
   if (trans.id) {
      return trans.id;
   } else {
      return "";
   }
}

///////////////////
// Bytes <-> Hex //
///////////////////

// Convert a hex string to a byte array
export function hexToBytes(hex: string): Uint8Array {
   let bytes = [];
   for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
   return new Uint8Array(bytes);
}

// Convert a byte array to a hex string
export function bytesToHex(bytes: any) {
   for (var hex = [], i = 0; i < bytes.length; i++) {
      var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      hex.push((current >>> 4).toString(16));
      hex.push((current & 0xf).toString(16));
   }
   return hex.join("");
}

////////////////////
// Base32 <-> Hex //
////////////////////

/**
 * Algos base32 to hex string
 * @param data
 * @returns
 */
export function base32ToHex(data: string): string {
   // old base 32 decoding
   const decoder = new base32.Decoder({ type: "rfc4648" });
   let out = decoder.write(data).finalize();
   return out.toString("hex");
   // hibase 32
   // return Buffer.from(hibase32.decode.asBytes(data)).toString("hex")
}

export function hexToBase32(hex: string | Uint8Array) {
   // old base 32 encoding
   const encoder = new base32.Encoder({ type: "rfc4648" });
   let bufHex = Buffer.from(hex);
   let base32Out = encoder.write(bufHex).finalize();
   return base32Out;
   // hibase 32
   // return hibase32.encode(hex)
}

////////////////////
// Base64 <-> Hex //
////////////////////

/**
 * For note decoding
 * @param rawdata
 * @returns
 * @dev todo stay away from deprecated atob
 */
export function base64ToHex(rawdata: string) {
   // let data = atob(rawdata);
   let data = Buffer.from(rawdata, "base64").toString("binary");
   let hexData = "";
   for (let i = 0; i < data.length; i++) {
      const hex = data.charCodeAt(i).toString(16);
      hexData += hex.length === 2 ? hex : "0" + hex;
   }
   return hexData;
}

export function hexToBase64(hex: string | Uint8Array) {
   if (typeof hex === "string") {
      return Buffer.from(hex, "hex").toString("base64");
   } else {
      return Buffer.from(bytesToHex(hex), "hex").toString("base64");
   }
}

/////////////////////
// Base64 <-> Text //
/////////////////////

/**
 *
 * @dev used for transaction note parsing
 * @param rawdata
 * @returns
 */
export function base64ToText(rawdata: string) {
   // return atob(rawdata);
   let buff = Buffer.from(rawdata, "base64");
   return buff.toString("ascii");
}

//////////////////////////
// Algo address <-> Hex //
//////////////////////////

export function addressToHex(address: string): IAlgoHexAddress {
   if (!algosdk.isValidAddress(address)) {
      throw INVALIDADDRESERROR(address);
   }
   let dad = algosdk.decodeAddress(address);
   const publicKey = Buffer.from(dad.publicKey).toString("hex");
   const checksum = Buffer.from(dad.checksum).toString("hex");
   return {
      publicKey: prefix0x(publicKey),
      checksum: prefix0x(checksum),
   } as IAlgoHexAddress;
}

export function hexToAddress(algoKeyPair: IAlgoHexAddress): string {
   let conc = unPrefix0x(algoKeyPair.publicKey) + unPrefix0x(algoKeyPair.checksum);
   let concBytes = hexToBytes(conc);
   const address = hexToBase32(concBytes);
   if (!algosdk.isValidAddress(address)) {
      throw INVALIDPUBKEYPAIRERROR(algoKeyPair);
   }
   return address;
}

/////////////////////////////////
// Algo transaction id <-> Hex //
/////////////////////////////////

export function txIdToHex(txid: string): string {
   return prefix0x(base32ToHex(txid));
}

export function txIdToHexNo0x(txid: string) {
   return base32ToHex(txid);
}

/////////////////////////////////
// Algo Checksum ////////////////
/////////////////////////////////

export function checksum(str: string, algorithm: string = "sha512", encoding: string = "hex") {
   return crypto.createHash(algorithm).update(str, "utf8").digest(encoding);
}

////////////////////////////
//// MCC Error handling ////
////////////////////////////

export function algo_ensure_data(data: any) {
   const error_codes = [400, 401, 404, 500, 503];
   if (error_codes.includes(data.status)) {
      throw MccError(data);
   }
}

export function algo_check_expect_block_out_of_range(data: any): boolean {
   if (data.status === 404) {
      return true;
   } else {
      return false;
   }
}

export function algo_check_expect_empty(data: any): boolean {
   if (data.status === 404) {
      return true;
   } else {
      return false;
   }
}
