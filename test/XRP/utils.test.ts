import { MCC, bytesToRippleAddress, rippleAddressToBytes, rippleTimeToUnixEpoch, unixEpochToRippleTime } from "../../src";
import { assert, expect } from "chai";
import { GETTERS_AMOUNTS, GETTERS_BASIC, GETTERS_BN, GETTERS_LISTS } from "../testUtils";
import { checkTransactionTypes } from "./xrplJsTransactionTypesCheck";
import { XrpTransaction } from "../../src/base-objects";

describe("Test utils ", function () {
   it("should convert empty address to bytes ", async function () {
      const byts = rippleAddressToBytes("");

      expect(byts.length).to.eq(1);
   });

   it("should convert classic account to bytes ", async function () {
      const acc = "r4BhzWSGGjTeSdpcXMPoT1AbiCQm76FQGd";
      const byts = rippleAddressToBytes(acc);

      expect(byts.length).to.eq(20);
   });

   it("should convert x-account to bytes ", async function () {
      const acc = "XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8yuPT7y4xaEHi";
      const byts = rippleAddressToBytes(acc);

      expect(byts.length).to.eq(20);
   });

   it("should check that classic and x-account to bytes match ", async function () {
      const acc = "XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8yuPT7y4xaEHi";
      const classicAcc = "rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf";
      const byts = rippleAddressToBytes(acc);
      const cByts = rippleAddressToBytes(classicAcc);

      expect(byts.length).to.eq(20);
      expect(cByts.length).to.eq(20);
      expect(Buffer.compare(byts, cByts)).to.eq(0);
   });

   it("should encode and decode to same acc string ", async function () {
      const classicAcc = "rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf";
      const cByts = rippleAddressToBytes(classicAcc);
      const decode = bytesToRippleAddress(cByts);

      expect(cByts.length).to.eq(20);
      expect(classicAcc).to.eq(decode);
   });

   it("should not convert from bytes to ripple address", async function () {
      const byts = Buffer.from("0x00");
      const fn = () => {
         return bytesToRippleAddress(byts);
      };
      const er = `Not a valid ripple address`;
      expect(fn).to.throw(Error);
      expect(fn).to.throw(er);
   });

   it("should not decode from x-account to bytes ", async function () {
      const acc = "XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8yuPT7y4xaEHi";
      const classicAcc = "rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf";
      const byts = rippleAddressToBytes(acc);
      const decode = bytesToRippleAddress(byts);

      expect(byts.length).to.eq(20);
      expect(classicAcc).to.eq(decode);
   });

   it("should convert from ripple time to unix epoch", async function () {
      //1.1.2022 in ripple time = 694310400
      //1.1.2022 in unix epoch = 1640995200
      const rt2022 = 694310400;
      const expected = 1640995200;
      const res = rippleTimeToUnixEpoch(rt2022);
      expect(res).to.equal(expected);
   });

   it("should convert from unix epoch to ripple time", async function () {
      //1.1.2022 in ripple time = 694310400
      //1.1.2022 in unix epoch = 1640995200
      const ux2022 = 1640995200;
      const expected = 694310400;
      const res = unixEpochToRippleTime(ux2022);
      expect(res).to.equal(expected);
   });

   describe("transaction types", function () {
      it("should match xrpl types", async function () {
         const checkPassed = await checkTransactionTypes();
         assert(checkPassed);
      });
   });

   describe("getters", function () {
      let tx: XrpTransaction;

      before(async function () {
         const XRPMccConnection = {
            url: process.env.XRP_URL || "",
            username: process.env.XRP_USERNAME || "",
            password: process.env.XRP_PASSWORD || "",
            apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
         };
         const client = new MCC.XRP(XRPMccConnection);

         tx = await client.getTransaction("CFD798AA6AB21AAAF9459A59A7AF4C8A8414374F735D585D605D493317EFCC05");
      });

      for (const getters of [GETTERS_AMOUNTS, GETTERS_BASIC, GETTERS_BN, GETTERS_LISTS]) {
         for (let getter of getters) {
            it(`should have getter ${getter}`, function () {
               expect(getter in tx);
            });
         }
      }
   });
});
