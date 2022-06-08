import { bytesToRippleAddress, MCC, rippleAddressToBytes, XrpNodeStatus } from "../../src";
import { expect } from "chai";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
};

describe("Test utils ", function () {
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

   it("should decode from x-account to bytes and back to its classsic account ", async function () {
      const acc = "XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8yuPT7y4xaEHi";
      const classicAcc = "rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf";
      const byts = rippleAddressToBytes(acc);
      const decode = bytesToRippleAddress(byts);

      expect(byts.length).to.eq(20);
      expect(classicAcc).to.eq(decode);
   });
});
