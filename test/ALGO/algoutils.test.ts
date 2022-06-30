import { expect } from "chai";
import { AlgoBlock, MCC, traceManager } from "../../src";
import { addressToHex, algo_check_expect_block_out_of_range, algo_check_expect_empty, algo_ensure_data, ApplyData, base32ToHex, base64ToHex, base64ToText, bufAddToCBufAdd, bytesToHex, concatArrays, EvalDelta, hasher, hexToAddress, hexToBase32, hexToBase64, hexToBytes, mpDecode, mpEncode, SignedTransactionWithAD, StateDelta, txIdToHex, txIdToHexNo0x } from "../../src/utils/algoUtils";
import { mccJsonStringify } from "../../src/utils/utils";
import { addressToBtyeAddress } from "../testUtils";

describe("ALGO utils tests", () => {
   before(async function () {
      traceManager.displayStateOnException = false;
   })

   describe("ALGO address <-> hex", () => {
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

      it("should throw invalid address", function () {
         const address = "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN2B";
         const fn = () => {
            return addressToHex(address);
         };
         const er = `Invalid address: ${address}`;
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
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
            66,   2,   8,  64, 224, 159,   7, 166,
            59, 253, 162, 230,  98, 221,  58, 108,
           184,  38, 243, 153, 157, 122, 167, 241,
            43, 113,  49, 207,  48,  79, 122,  87
         ]);
         const hex = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const bytes = hexToBytes(hex);
         expect(bytes).to.eql(expected);
      });

      it("bytes -> hex ", async function () {
         const expected = "42020840e09f07a63bfda2e662dd3a6cb826f3999d7aa7f12b7131cf304f7a57";
         const bytes = new Uint8Array([
            66,   2,   8,  64, 224, 159,   7, 166,
            59, 253, 162, 230,  98, 221,  58, 108,
           184,  38, 243, 153, 157, 122, 167, 241,
            43, 113,  49, 207,  48,  79, 122,  87
         ]);
         const hex = bytesToHex(bytes);
         expect(hex).to.equal(expected);
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
            66,   2,   8,  64, 224, 159,   7, 166,
            59, 253, 162, 230,  98, 221,  58, 108,
           184,  38, 243, 153, 157, 122, 167, 241,
            43, 113,  49, 207,  48,  79, 122,  87
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
         const expected = "QgIIQOCfB6Y7/aLmYt06bLgm85mdeqfxK3ExzzBPelc="
         const bytes = new Uint8Array([
            66,   2,   8,  64, 224, 159,   7, 166,
            59, 253, 162, 230,  98, 221,  58, 108,
           184,  38, 243, 153, 157, 122, 167, 241,
            43, 113,  49, 207,  48,  79, 122,  87
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
      it("should throw error - 400", async function() {
         const data = { status: 400 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should throw error - 401", async function() {
         const data = { status: 401 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should throw error - 404", async function() {
         const data = { status: 404 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should throw error - 500", async function() {
         const data = { status: 500 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should throw error - 503", async function() {
         const data = { status: 503 };
         const fn = () => {
            return algo_ensure_data(data);
         };
         const er = mccJsonStringify(data);
         expect(fn).to.throw(Error);
         expect(fn).to.throw(er);
      });
      it("should return true - 404", async function() {
         const data = { status: 404 };
         expect(algo_check_expect_block_out_of_range(data)).to.equal(true);
         expect(algo_check_expect_empty(data)).to.equal(true);
      });
      it("should return false", async function() {
         const data = { status: 200 };
         expect(algo_check_expect_block_out_of_range(data)).to.equal(false);
         expect(algo_check_expect_empty(data)).to.equal(false);
      });
   });

   describe("ALGO Light block updates", () => {
      let MccClient: MCC.ALGO;
      let block: AlgoBlock;
      const blockNumber = 21_659_776;
      let sd = new StateDelta(); let sd2 = new StateDelta();
      let obj1sd = {}; let obj2sd = {}; let obj3ed = {}; let obj4ad = {};
      let ed = new EvalDelta({}); let ed2 = new EvalDelta({});
      let ad = new ApplyData({});
      let st: SignedTransactionWithAD;
      let transaction: any;
      const algoCreateConfig = {
         algod: {
            url: process.env.ALGO_ALGOD_URL || "",
            token: process.env.ALGO_ALGOD_TOKEN || "",
         },
      };

      before(async function () {
         MccClient = new MCC.ALGO(algoCreateConfig);
         block = await MccClient.getBlock(blockNumber);
         transaction = block.data.block.txns[0];
         transaction["aca"] = 1;
         transaction["ca"] = 2;
         //init st
         st = new SignedTransactionWithAD(Buffer.from(""), "", transaction);
         // init sd
         sd.action = 1;
         sd.bytes = new Uint8Array([
            66,   2,   8,  64, 224, 159,   7, 166,
            59, 253, 162, 230,  98, 221,  58, 108,
            184,  38, 243, 153, 157, 122, 167, 241,
            43, 113,  49, 207,  48,  79, 122,  87
         ]);
         sd.uint = 1;
         sd2.action = 0;
         sd2.bytes = new Uint8Array();
         // sd2.uint = 5;
         obj1sd = {
            "at": 1,
            "bs": new Uint8Array([
               66,   2,   8,  64, 224, 159,   7, 166,
               59, 253, 162, 230,  98, 221,  58, 108,
               184,  38, 243, 153, 157, 122, 167, 241,
               43, 113,  49, 207,  48,  79, 122,  87
            ]),
            "ui": 1
         };
         obj2sd = {
            // "ui": 5,
         };
         //init ed
         obj3ed = {
            "gd": [obj1sd, obj2sd], 
            "ld": {1: [obj1sd, obj2sd], 2: [obj1sd]},
            "lg": ["log0", "log1", "log2"]
         };
         ed.global_delta = [sd, sd2];
         ed.local_deltas = {1: [sd, sd2], 2: [sd]};
         ed.logs = ["log0", "log1", "log2"];
         ed.inner_txns = [];
         //init ad
         obj4ad = {
            "ca" : 1,
            "aca" : 2,
            "rs" : 3,
            "rr" : 4,
            "rc" : 5,
            "caid" : 6,
            "apid" : 7,
            "dt" : obj3ed
         };
         ad.closing_amount = 1;
         ad.asset_closing_amount = 2;
         ad.sender_rewards = 3;
         ad.receiver_rewards = 4;
         ad.close_rewards = 5;
         ad.eval_delta = ed;
         ad.config_asset = 6;
         ad.application_id = 7;
      });


      describe("StateDelta class", () => {
         it("state delta msgp should be equal - empty object", async function() {
            const expected = StateDelta.fromMsgp({});
            const res = StateDelta.fromMsgp({});
            expect(res).to.eql(expected);
         });
         it("state delta msgp should be equal", async function() {
            const res = StateDelta.fromMsgp(obj1sd);
            expect(res).to.eql(sd);
         });
         it("state delta msgp should be equal 2", async function() {
            const res = StateDelta.fromMsgp(obj2sd);
            expect(res).to.eql(sd2);
         });
         it("state delta object for encoding should be equal", async function() {
            const expected = {
               "at": 1,
               "bs": new Uint8Array([
                  66,   2,   8,  64, 224, 159,   7, 166,
                  59, 253, 162, 230,  98, 221,  58, 108,
                  184,  38, 243, 153, 157, 122, 167, 241,
                  43, 113,  49, 207,  48,  79, 122,  87
               ]),
               "ui": 1
            }
            const res = sd.get_obj_for_encoding();
            expect(res).to.eql(expected);
         });
      });
      describe("EvalDelta class", () => {
         it("eval delta msgp should be equal", async function() {
            const res = await EvalDelta.fromMsgp(obj3ed);
            expect(res).to.eql(ed);
         });
         it("eval delta object for encoding should be equal", async function() {
            const res = ed.get_obj_for_encoding();
            expect(res).to.eql(obj3ed);
         });
         it("eval delta object for encoding should be equal 2", async function() {
            const res = ed2.get_obj_for_encoding();
            expect(res).to.eql({});
         });
         it("eval delta object for encoding should be equal", async function() {
            ed.inner_txns = [new SignedTransactionWithAD(Buffer.from(""), "", transaction)];
            const res = ed.get_obj_for_encoding();
            const ed_again = await EvalDelta.fromMsgp(res);
            expect(ed).to.eql(ed_again);
         });


      });
      describe("ApplyData class", () => {
         it("apply data msgp should be equal - empty object", async function() {
            const res = ApplyData.fromMsgp({});
            expect(res).to.eql(new ApplyData({}));
         });
         it("apply data msgp should be equal", async function() {
            ed.inner_txns = [];
            const res = await ApplyData.fromMsgp(obj4ad);
            expect(res).to.eql(ad);
         });
         it("apply data object for encoding should be equal", async function() {
            const ad2 = new ApplyData({});
            const res = ad2.get_obj_for_encoding();
            expect(res).to.eql({});
         });
         it("apply data object for encoding should be equal 2", async function() {
            const res = ad.get_obj_for_encoding();
            expect(res).to.eql(obj4ad);
         });
      });
      describe("SignedTransactionWithAD class", () => {
         it("signed transaction with AD object for encoding should be equal", async function() {
            const res = st.get_obj_for_encoding();
            const st_again = new SignedTransactionWithAD(Buffer.from(""), "", res);
            expect(st).to.eql(st_again);
         });
         it("signed transaction with AD object for encoding should be equal 2", async function() {
            delete(transaction["sig"]);
            transaction["lsig"] = "lsig";
            transaction["msig"] = "msig";
            transaction["sgnr"] = "sgnr";
            const st2 = new SignedTransactionWithAD(Buffer.from("stib"), "stib", transaction);
            delete st2.apply_data;
            const res = st2.get_obj_for_encoding();
            const st_again = new SignedTransactionWithAD(Buffer.from("stib"), "stib", res);
            delete st_again.apply_data;
            expect(st2).to.eql(st_again);
         });     
      });
   });


   describe("ALGO helper functions", () => {
      const arr0 = [1, 2, 3, 4, 5];
      it("concat one array", async function() {
         const expected = new Uint8Array([1, 2, 3, 4, 5]);
         let res = concatArrays(arr0);
         expect(res).to.be.eql(expected);
      });
      it("concat multiple arrays", async function() {
         const expected = new Uint8Array([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 10, 11, 12, 0, 0]);
         let res = concatArrays(arr0, arr0,  {0: 10, 1: 11, 2: 12, length: 5});
         expect(res).to.be.eql(expected);
      });
      it("hash an array", async function() {
         const expected = new Uint8Array([
            25, 181, 125,  65, 111,  93,  89, 122,
            212,   7, 132, 243,   5,   0, 180, 208,
            126, 217, 103, 190, 245, 236, 136,  60,
            129,  85,  77, 233, 246, 250, 108,  61
         ]);
         let res = hasher(new Uint8Array(arr0));
         expect(res).to.be.eql(expected);
      });
      it("msgpack", async function() {
         let res = mpEncode(arr0);
         let arr0_again = mpDecode(res);
         expect(arr0).to.be.eql(arr0_again);
      });
   });
});
