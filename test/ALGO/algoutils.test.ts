import { expect } from "chai";
import { traceManager } from "../../src";
import {
   addressToHex,
   algo_check_expect_block_out_of_range,
   algo_check_expect_empty,
   algo_ensure_data,
   base32ToHex,
   base64ToHex,
   base64ToText,
   bufAddToCBufAdd,
   bytesToHex,
   concatArrays,
   hasher,
   hexToAddress,
   hexToBase32,
   hexToBase64,
   mpDecode,
   mpEncode,
   txIdToHex,
   txIdToHexNo0x,
} from "../../src/utils/algoUtils";
import { hexToBytes, mccJsonStringify } from "../../src/utils/utils";
import { addressToBtyeAddress } from "../testUtils";

describe("ALGO utils tests", () => {
   before(async function () {
      traceManager.displayStateOnException = false;
   });

   describe("ALGO address <-> hex", () => {
      it("should decode address to hex pair ", function () {
         const address = "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A";
         const decoded = {
            publicKey: "0x06c0d7985fae2d64be14b9b4d9d5b07b3df0931baf01828f2c06bb6c0fe500ba",
            checksum: "0xa7084de0",
         };
         const dec = addressToHex(address);
         expect(dec.publicKey).to.equal(decoded.publicKey);
         expect(dec.checksum).to.equal(decoded.checksum);
      });

      it("should throw invalid address", function () {
         const address = "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN2B";
         const fn = () => {
            return addressToHex(address);
         };
         const er = `Invalid address: ${address}`;
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });

      it("should decode transaction id", function () {
         const transactionId = "CRMERBQOF6PIDRWCD2XKUD6L7YWUQ5VYOLAJ5IRJJYM2SZNZFRBA";
         const transactionDecoded = txIdToHex(transactionId);
         console.log(transactionDecoded);
      });

      it("should encode address", function () {
         const address = "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A";
         const decoded = {
            publicKey: "0x06c0d7985fae2d64be14b9b4d9d5b07b3df0931baf01828f2c06bb6c0fe500ba",
            checksum: "0xa7084de0",
         };
         const encodedAddress = hexToAddress(decoded);
         expect(encodedAddress).to.equal(address);
      });

      it("should throw incorrect public key due to wrong checksum", function () {
         const decoded = {
            publicKey: "0x06c0d7985fae2d64be14b9b4d9d5b07b3df0931baf01828f2c06bb6c0fe500ba",
            checksum: "0xa7084dff",
         };
         const fn = () => {
            return hexToAddress(decoded);
         };
         const er = `Invalid keypair: ${decoded.publicKey} -  ${decoded.checksum}`;
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });

      it("should throw incorrect public key due to wrong public key", function () {
         const decoded = {
            publicKey: "0x06c0d7985fae2d64be14b9b4d9d5b07b3df0931baf01828f2c06bb6c0fe500ff",
            checksum: "0xa7084de0",
         };
         const fn = () => {
            return hexToAddress(decoded);
         };
         const er = `Invalid keypair: ${decoded.publicKey} -  ${decoded.checksum}`;
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
   });

   describe("ALGO transaction id <-> hex", () => {
      it("should encode txId", function () {
         const txid = "K6HBZAEREHOYVDA2PR5I56MIAOFAIHGSZLUZFCON3RRSATCMNX6Q";
         const encodedTxid = txIdToHex(txid);
         const txidhex = "0x578e1c809121dd8a8c1a7c7a8ef988038a041cd2cae99289cddc63204c4c6dfd";
         expect(encodedTxid).to.equal(txidhex);
      });

      it("should encode txIdToHexNo0x", function () {
         const txid = "K6HBZAEREHOYVDA2PR5I56MIAOFAIHGSZLUZFCON3RRSATCMNX6Q";
         const encodedTxid = txIdToHexNo0x(txid);
         const txidhex = "578e1c809121dd8a8c1a7c7a8ef988038a041cd2cae99289cddc63204c4c6dfd";
         expect(encodedTxid).to.equal(txidhex);
      });
   });

   describe("ALGO bytes <-> hex", () => {
      it("hex -> bytes ", async function () {
         const expected = new Uint8Array([
            66, 2, 8, 64, 224, 159, 7, 166, 59, 253, 162, 230, 98, 221, 58, 108, 184, 38, 243, 153, 157, 122, 167, 241, 43, 113, 49, 207, 48, 79, 122, 87,
         ]);
         const hex = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const bytes = hexToBytes(hex);
         expect(bytes).to.eql(expected);
      });

      it("bytes as Buffer -> hex ", async function () {
         const expected = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const bytes = Buffer.from([
            66, 2, 8, 64, 224, 159, 7, 166, 59, 253, 162, 230, 98, 221, 58, 108, 184, 38, 243, 153, 157, 122, 167, 241, 43, 113, 49, 207, 48, 79, 122, 87,
         ]);
         const hex = bytesToHex(bytes);
         expect(hex).to.equal(expected);
      });

      it("bytes as Uint8Array -> hex ", async function () {
         const expected = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const bytes = new Uint8Array([
            66, 2, 8, 64, 224, 159, 7, 166, 59, 253, 162, 230, 98, 221, 58, 108, 184, 38, 243, 153, 157, 122, 167, 241, 43, 113, 49, 207, 48, 79, 122, 87,
         ]);
         const hex = bytesToHex(bytes);
         expect(hex).to.equal(expected);
      });

      it("bytes as Uint8Array -> hex ", async function () {
         const expected = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const uint8 = new Uint8Array([
            66, 2, 8, 64, 224, 159, 7, 166, 59, 253, 162, 230, 98, 221, 58, 108, 184, 38, 243, 153, 157, 122, 167, 241, 43, 113, 49, 207, 48, 79, 122, 87,
         ]);
         const buffer = new Buffer([
            66, 2, 8, 64, 224, 159, 7, 166, 59, 253, 162, 230, 98, 221, 58, 108, 184, 38, 243, 153, 157, 122, 167, 241, 43, 113, 49, 207, 48, 79, 122, 87,
         ]);
         const bufferFrom = Buffer.from([
            66, 2, 8, 64, 224, 159, 7, 166, 59, 253, 162, 230, 98, 221, 58, 108, 184, 38, 243, 153, 157, 122, 167, 241, 43, 113, 49, 207, 48, 79, 122, 87,
         ]);

         console.log("uint8    | uint8", uint8 instanceof Uint8Array);
         console.log("uint8    | buffer", uint8 instanceof Buffer);

         console.log("buffer   | uint8", buffer instanceof Uint8Array);
         console.log("buffer   | buffer", buffer instanceof Buffer);

         console.log("buffer f | uint8", bufferFrom instanceof Uint8Array);
         console.log("buffer f | buffer", bufferFrom instanceof Buffer);
      });
   });

   describe("ALGO base32 <-> hex", () => {
      it("base32 -> hex ", async function () {
         const expected = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const base32hex = base32ToHex("IIBAQQHAT4D2MO75ULTGFXJ2NS4CN44ZTV5KP4JLOEY46MCPPJLQ");
         expect(base32hex).to.equal(expected);
      });

      it("hex -> base32 from hex", async function () {
         const expected = "IIBAQQHAT4D2MO75ULTGFXJ2NS4CN44ZTV5KP4JLOEY46MCPPJLQ";
         const hex = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const base32hex = hexToBase32(hex);
         expect(base32hex).to.equal(expected);
      });

      it("hex -> base32 from uint8array", async function () {
         const expected = "IIBAQQHAT4D2MO75ULTGFXJ2NS4CN44ZTV5KP4JLOEY46MCPPJLQ";
         const bytes = new Uint8Array([
            66, 2, 8, 64, 224, 159, 7, 166, 59, 253, 162, 230, 98, 221, 58, 108, 184, 38, 243, 153, 157, 122, 167, 241, 43, 113, 49, 207, 48, 79, 122, 87,
         ]);
         const base32hex = hexToBase32(bytes);
         expect(base32hex).to.equal(expected);
      });
   });

   describe("ALGO base64 <-> hex", () => {
      it("base64 -> hex ", async function () {
         const expected = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const base64hex = base64ToHex("QgIIQOCfB6Y7/aLmYt06bLgm85mdeqfxK3ExzzBPelc=");
         expect(base64hex).to.equal(expected);
      });

      it("hex -> base64 from hex", async function () {
         const expected = "QgIIQOCfB6Y7/aLmYt06bLgm85mdeqfxK3ExzzBPelc=";
         const hex = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const base64hex = hexToBase64(hex);
         expect(base64hex).to.equal(expected);
      });

      it("hex -> base64 from uint8array", async function () {
         const expected = "QgIIQOCfB6Y7/aLmYt06bLgm85mdeqfxK3ExzzBPelc=";
         const bytes = new Uint8Array([
            66, 2, 8, 64, 224, 159, 7, 166, 59, 253, 162, 230, 98, 221, 58, 108, 184, 38, 243, 153, 157, 122, 167, 241, 43, 113, 49, 207, 48, 79, 122, 87,
         ]);
         const base64hex = hexToBase64(bytes);
         expect(base64hex).to.equal(expected);
      });
   });

   describe("ALGO base64 -> text", () => {
      it("base64 -> text ", async function () {
         const expected = "algorand test";
         const base64text = base64ToText("YWxnb3JhbmQgdGVzdA==");
         expect(base64text).to.equal(expected);
      });
   });

   describe("ALGO buffer address -> buffer address + checksum", () => {
      it("buffer address -> buffer address + checksum", async function () {
         const byteAddress = addressToBtyeAddress("A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A");
         const expected = Buffer.from(byteAddress);

         const bufferAddress = Buffer.from(byteAddress.slice(0, 32));
         const bufferAddressWithCheckSum = bufAddToCBufAdd(bufferAddress);
         expect(bufferAddressWithCheckSum).to.eql(expected);
      });

      it("buffer address + checksum -> buffer address + checksum", async function () {
         const byteAddress = addressToBtyeAddress("A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A");
         const expected = Buffer.from(byteAddress);

         const bufferAddress = Buffer.from(byteAddress);
         const bufferAddressWithCheckSum = bufAddToCBufAdd(bufferAddress);
         expect(bufferAddressWithCheckSum).to.eql(expected);
      });

      it("should throw invalid address buffer", async function () {
         const address = "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A";
         const bufferAddress = Buffer.from(address);
         const fn = () => {
            return bufAddToCBufAdd(bufferAddress);
         };
         const er = `Not a valid address buffer: ${bufferAddress}`;
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
   });

   describe("MCC Error handling", () => {
      it("should throw error - 400", async function () {
         const data = { status: 400 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should throw error - 401", async function () {
         const data = { status: 401 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should throw error - 404", async function () {
         const data = { status: 404 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should throw error - 500", async function () {
         const data = { status: 500 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should throw error - 503", async function () {
         const data = { status: 503 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should return true - 404", async function () {
         const data = { status: 404 };
         expect(algo_check_expect_block_out_of_range(data)).to.equal(true);
         expect(algo_check_expect_empty(data)).to.equal(true);
      });
      it("should return false", async function () {
         const data = { status: 200 };
         expect(algo_check_expect_block_out_of_range(data)).to.equal(false);
         expect(algo_check_expect_empty(data)).to.equal(false);
      });
   });

   describe("ALGO helper functions", () => {
      const arr0 = [1, 2, 3, 4, 5];
      it("concat one array", async function () {
         const expected = new Uint8Array([1, 2, 3, 4, 5]);
         const res = concatArrays(arr0);
         expect(res).to.be.eql(expected);
      });
      it("concat multiple arrays", async function () {
         const expected = new Uint8Array([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 10, 11, 12, 0, 0]);
         const res = concatArrays(arr0, arr0, { 0: 10, 1: 11, 2: 12, length: 5 });
         expect(res).to.be.eql(expected);
      });
      it("hash an array", async function () {
         const expected = new Uint8Array([
            25, 181, 125, 65, 111, 93, 89, 122, 212, 7, 132, 243, 5, 0, 180, 208, 126, 217, 103, 190, 245, 236, 136, 60, 129, 85, 77, 233, 246, 250, 108, 61,
         ]);
         const res = hasher(new Uint8Array(arr0));
         expect(res).to.be.eql(expected);
      });
      it("msgpack", async function () {
         const res = mpEncode(arr0);
         const arr0_again = mpDecode(res);
         expect(arr0).to.be.eql(arr0_again);
      });
   });
});
