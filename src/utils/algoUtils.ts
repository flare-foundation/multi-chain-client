import { IAlgoTransaction } from "../types";
import { IAlgoHexAddress } from "../types/algoTypes";
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
      let bufHex = Buffer.from(hex, 'hex');
      let base32Out = encoder.write(bufHex).finalize();
      return base32Out;
   } else {
      let bufHex = Buffer.from(bytesToHex(hex), 'hex');
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

export class StateDelta {
   action: number = 0;
   bytes: Uint8Array = new Uint8Array();
   uint: number | undefined = undefined;

   static fromMsgp(state_delta: any): StateDelta {
      const sd = new StateDelta();
      if ("at" in state_delta) sd.action = state_delta["at"];
      if ("bs" in state_delta) sd.bytes = state_delta["bs"];
      if ("ui" in state_delta) sd.uint = state_delta["ui"];
      return sd;
   }

   get_obj_for_encoding() {
      const obj: any = {};
      if (this.action !== 0) obj["at"] = this.action;
      if (this.bytes.length > 0) obj["bs"] = this.bytes;
      if (this.uint !== undefined) obj["ui"] = this.uint;
      return obj;
   }
}

export class EvalDelta {
   global_delta: StateDelta[] = [];
   local_deltas: { [key: number]: StateDelta[] } = {};
   logs: string[] = [];
   inner_txns: SignedTransactionWithAD[] = [];

   constructor(o: { global_delta?: StateDelta[]; local_deltas?: { [key: number]: StateDelta[] }; logs?: string[]; inner_txns?: SignedTransactionWithAD[] }) {}

   static fromMsgp(delta: any): EvalDelta {
      const ed = new EvalDelta({});

      if ("gd" in delta) {
         try {
            for (const idx of delta["gd"]) {
               ed.global_delta.push(StateDelta.fromMsgp(idx));
            }
         } catch (e) {
            // TODO apparently not a part of txid -.-
         }
      }
      if ("ld" in delta) {
         try {
            for (const k in delta["ld"]) {
               ed.local_deltas[Number(k)] = [];
               delta["ld"][k].map( (sd: any) => { 
                  ed.local_deltas[Number(k)].push(StateDelta.fromMsgp(sd));
               });
            }
         } catch (e) {
            // TODO apparently not a part of txid -.-
         }
      }

      if ("itx" in delta) {
         try {
            for (const itxn of delta["itx"]) {
               ed.inner_txns.push(new SignedTransactionWithAD(Buffer.from(""), "", itxn));
            }
         } catch (e) {
            // TODO apparently not a part of txid -.-
         }
      }

      if ("lg" in delta) ed.logs = delta["lg"];

      return ed;
   }

   get_obj_for_encoding() {
      const obj: any = {};

      if (this.global_delta.length > 0)
         obj["gd"] = this.global_delta.map((gd) => {
            return gd.get_obj_for_encoding();
         });
      if (Object.keys(this.local_deltas).length > 0) {
         obj["ld"] = {};
         Object.keys(this.local_deltas).map((el) => {
            obj["ld"][el] = this.local_deltas[Number(el)].map((sd) => {
               return sd.get_obj_for_encoding();
            })
         })
      }
      if (this.logs.length > 0) obj["lg"] = this.logs;
      if (this.inner_txns.length > 0)
         obj["itx"] = this.inner_txns.map((itxn) => {
            return itxn.get_obj_for_encoding();
         });

      return obj;
   }
}

export class ApplyData {
   closing_amount: number = 0;
   asset_closing_amount: number = 0;
   sender_rewards: number = 0;
   receiver_rewards: number = 0;
   close_rewards: number = 0;
   eval_delta: EvalDelta | undefined = undefined;
   config_asset: number = 0;
   application_id: number = 0;

   constructor(o: {
      closing_amount?: 0;
      asset_closing_amount?: 0;
      sender_rewards?: 0;
      receiver_rewards?: 0;
      close_rewards?: 0;
      eval_delta?: undefined;
      config_asset?: 0;
      application_id?: 0;
   }) {}

   static fromMsgp(apply_data: any): ApplyData {
      const ad = new ApplyData({});

      if ("ca" in apply_data) ad.closing_amount = apply_data["ca"];
      if ("aca" in apply_data) ad.asset_closing_amount = apply_data["aca"];
      if ("rs" in apply_data) ad.sender_rewards = apply_data["rs"];
      if ("rr" in apply_data) ad.receiver_rewards = apply_data["rr"];
      if ("rc" in apply_data) ad.close_rewards = apply_data["rc"];
      if ("caid" in apply_data) ad.config_asset = apply_data["caid"];
      if ("apid" in apply_data) ad.application_id = apply_data["apid"];
      if ("dt" in apply_data) ad.eval_delta = EvalDelta.fromMsgp(apply_data["dt"]);

      return ad;
   }

   get_obj_for_encoding() {
      const obj: any = {};

      if (this.closing_amount !== 0) obj["ca"] = this.closing_amount;
      if (this.asset_closing_amount !== 0) obj["aca"] = this.asset_closing_amount;
      if (this.sender_rewards !== 0) obj["rs"] = this.sender_rewards;
      if (this.receiver_rewards !== 0) obj["rr"] = this.receiver_rewards;
      if (this.close_rewards !== 0) obj["rc"] = this.close_rewards;
      if (this.config_asset !== 0) obj["caid"] = this.config_asset;
      if (this.application_id !== 0) obj["apid"] = this.application_id;
      if (this.eval_delta !== undefined) obj["dt"] = this.eval_delta.get_obj_for_encoding();

      return obj;
   }
}

export class SignedTransactionWithAD {
   txn: algosdk.SignedTransaction;
   apply_data: ApplyData | undefined = undefined;

   constructor(gh: Buffer, gen: string, stib: any) {
      const t = stib.txn as algosdk.EncodedTransaction;
      // Manually add gh/gen to construct a correct transaction object
      t.gh = gh;
      t.gen = gen;

      const stxn = {
         txn: algosdk.Transaction.from_obj_for_encoding(t),
      } as algosdk.SignedTransaction;

      if ("sig" in stib) stxn.sig = stib.sig;
      if ("lsig" in stib) stxn.lsig = stib.lsig;
      if ("msig" in stib) stxn.msig = stib.msig;
      if ("sgnr" in stib) stxn.sgnr = stib.sgnr;

      this.txn = stxn;

      this.apply_data = ApplyData.fromMsgp(stib);
   }

   get_obj_for_encoding() {
      const txn: any = this.txn.txn.get_obj_for_encoding();
      if (txn.gen !== "") {
         delete txn.gen;
         delete txn.gh;
      }

      const obj: any = {
         txn: txn,
         ...this.apply_data?.get_obj_for_encoding(),
      };

      if (this.txn.sig) obj["sig"] = this.txn.sig;
      if (this.txn.lsig) obj["lsig"] = this.txn.lsig;
      if (this.txn.msig) obj["msig"] = this.txn.msig;
      if (this.txn.sgnr) obj["sgnr"] = this.txn.sgnr;
      if (this.txn.txn.genesisID !== "") obj["hgi"] = true;

      return obj;
   }
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
