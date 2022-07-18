import { IAlgoTransaction } from "../types";
import { IAlgoCert, IAlgoHexAddress, IAlgoIndexerCert } from "../types/algoTypes";
import { MccError, prefix0x, unPrefix0x } from "./utils";
const base32 = require("base32.js");
const sha512_256 = require("js-sha512").sha512_256;
import * as msgpack from "algo-msgpack-with-bigint";
import algosdk from "algosdk";

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
export function bytesToHex(bytes: Buffer | Uint8Array): string {
   // should be: buffer and uint are unsigned
   for (var hex = [], i = 0; i < bytes.length; i++) {
      var current = bytes[i];
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
}

export function hexToBase32(hex: string | Uint8Array): string {
   // old base 32 encoding
   const encoder = new base32.Encoder({ type: "rfc4648" });
   if (typeof hex === "string") {
      let bufHex = Buffer.from(hex, "hex");
      let base32Out = encoder.write(bufHex).finalize();
      return base32Out;
   } else {
      let bufHex = Buffer.from(bytesToHex(hex), "hex");
      let base32Out = encoder.write(bufHex).finalize();
      return base32Out;
   }
}

////////////////////
// Base64 <-> Hex //
////////////////////

/**
 * For note decoding
 * @param rawdata
 * @returns
 */
export function base64ToHex(rawdata: string): string {
   let data = Buffer.from(rawdata, "base64").toString("binary");
   let hexData = "";
   for (let i = 0; i < data.length; i++) {
      const hex = data.charCodeAt(i).toString(16);
      hexData += hex.length === 2 ? hex : "0" + hex;
   }
   return hexData;
}

export function hexToBase64(hex: string | Uint8Array): string {
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
export function base64ToText(rawdata: string): string {
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

///////////////////////////////////////
// Algo address <-> address+checksum //
///////////////////////////////////////
// address checksum
// https://emn178.github.io/online-tools/sha512_256.html hash SHA512/256
// https://github.com/algorand/go-algorand-sdk/blob/develop/types/address.go


/**
 * buffer address to buffer address with checksum
 */
export function bufAddToCBufAdd(address: Buffer) {
   if (address.length === 32) {
      const checksumString = sha512_256.arrayBuffer(address);
      const checksum = checksumString.slice(28, 32);
      return Buffer.concat([address, Buffer.from(checksum)], 36);
   } else if (address.length === 36) {
      return address;
   } else {
      throw new Error(`Not a valid address buffer: ${address}`);
   }
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

//////////////////////////
// Algo cert id <-> Hex //
//////////////////////////

export function certToInCert(cert: IAlgoCert): IAlgoIndexerCert {
   const { prop, ...rest } = cert;
   const newCert: IAlgoIndexerCert = { prop: { dig: "", encdig: "", oprop: "" }, ...rest } as IAlgoIndexerCert;
   newCert.prop.dig = bytesToHex(cert.prop.dig);
   newCert.prop.encdig = bytesToHex(cert.prop.encdig);
   newCert.prop.oprop = bytesToHex(cert.prop.oprop);
   return newCert;
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

////////////////////////////////////////////
//// Message Pack encoding and decoding ////
////////////////////////////////////////////

export function mpEncode(obj: Record<string | number | symbol, any>) {
   // enable the canonical option
   const options = { sortKeys: true };
   return msgpack.encode(obj, options);
}

export function mpDecode(buffer: ArrayLike<number>) {
   return msgpack.decode(buffer);
}

////////////////////////////////////////////
//// Light (Non-Archival) block updates ////
////////////////////////////////////////////

// Reduce code
export function calculateAlgoTxid(gh: Buffer, gen: string, stib: any) {
   const t = stib.txn as algosdk.EncodedTransaction;
   // Manually add gh/gen to construct a correct transaction object
   if(stib.hgi){
      t.gh = gh;
      t.gen = gen;
   } else {
      t.gh = gh
      t.gen = '';
   }

   // Modify the fields as needed
   // we have to ensure all addresses are buffers with checksum
   t.snd = bufAddToCBufAdd(t.snd);
   if (t.rcv) t.rcv = bufAddToCBufAdd(t.rcv);
   if (t.arcv) t.arcv = bufAddToCBufAdd(t.arcv);

   const stxn = {
      txn: algosdk.Transaction.from_obj_for_encoding(t),
   } as algosdk.SignedTransaction;

   if ("sig" in stib) stxn.sig = stib.sig;
   if ("lsig" in stib) stxn.lsig = stib.lsig;
   if ("msig" in stib) stxn.msig = stib.msig;
   if ("sgnr" in stib) stxn.sgnr = stib.sgnr;

   return stxn.txn.txID();
}

export function hasher(data: Uint8Array): Uint8Array {
   const tohash = concatArrays(Buffer.from("STIB"), new Uint8Array(data));
   return new Uint8Array(sha512_256.array(tohash));
}

export function concatArrays(...arrs: ArrayLike<number>[]): Uint8Array {
   const size = arrs.reduce((sum, arr) => sum + arr.length, 0);
   const c = new Uint8Array(size);

   let offset = 0;
   for (let i = 0; i < arrs.length; i++) {
      c.set(arrs[i], offset);
      offset += arrs[i].length;
   }

   return c;
}
