import { expect } from "chai";
import { addressToHex, base64ToHex, bytesToHex, hexToAddress, hexToBase64, hexToBytes, INVALIDADDRESERROR, txIdToHex } from "../../src/utils/algoUtils";

describe("ALGO utils tests ", () => {
   it("should decode address to hex pair ", function () {
      const address = "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A";
      const decoded = {
         publicKey: "0x06c0d7985fae2d64be14b9b4d9d5b07b3df0931baf01828f2c06bb6c0fe500ba",
         checksum: "0xa7084de0",
      };
      let dec = addressToHex(address);
      expect(dec.publicKey).to.equal(decoded.publicKey);
      expect(dec.checksum).to.equal(decoded.checksum);
   });

   it("should throw invalid address ", function () {
      const address = "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN2B";
      const fn = () => {
         return addressToHex(address);
      };
      const er = `Invalid address: ${address}`;
      expect(fn).to.throw(Error);
      expect(fn).to.throw(er);
   });

   it("should encode address ", function () {
      const address = "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A";
      const decoded = {
         publicKey: "0x06c0d7985fae2d64be14b9b4d9d5b07b3df0931baf01828f2c06bb6c0fe500ba",
         checksum: "0xa7084de0",
      };
      const encodedAddress = hexToAddress(decoded);
      expect(encodedAddress).to.equal(address);
   });

   it("should throw incorrect public key due to wrong checksum ", function () {
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

   it("should throw incorrect public key due to wrong public key ", function () {
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

   it("should encode txId ", function () {
      const txid = "K6HBZAEREHOYVDA2PR5I56MIAOFAIHGSZLUZFCON3RRSATCMNX6Q";
      const encodedTxid = txIdToHex(txid);
      const txidhex = "0x578e1c809121dd8a8c1a7c7a8ef988038a041cd2cae99289cddc63204c4c6dfd";
      expect(encodedTxid).to.equal(txidhex);
   });

   describe("ALGO base64 <-> hex ", () => {
      it("base64 -> hex ", async function () {
         const expected = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const base64hex = base64ToHex("QgIIQOCfB6Y7/aLmYt06bLgm85mdeqfxK3ExzzBPelc=");
         expect(base64hex).to.equal(expected);
      });

      it("hex -> base64 ", async function () {
         const expected = "QgIIQOCfB6Y7/aLmYt06bLgm85mdeqfxK3ExzzBPelc=";
         const hex = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const base64hex = hexToBase64(hex);
         expect(base64hex).to.equal(expected);
      });
   });

   describe("ALGO checksum ", () => {
      it.skip("shoud be able to calculate checksum ", async function () {
      });
   });

   it("decode base32", async () => {});
});
