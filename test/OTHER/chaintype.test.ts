import { expect } from "chai";
import { ChainType, MCC, traceManager } from "../../src";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

describe("Lite block base test ", function () {
   before(async function () {
      traceManager.displayStateOnException = false;
   });

   describe("getChainType", function () {
      it("Should get chainType : default", async function () {
         const en = MCC.getChainType("default");
         expect(en).to.eq(ChainType.invalid);
      });

      it("Should get chainType : DOGE", async function () {
         const en = MCC.getChainType("DOGE");
         expect(en).to.eq(ChainType.DOGE);
      });

      it("Should get chainType : DOGE", async function () {
         const en = MCC.getChainType(ChainType.DOGE);
         expect(en).to.eq(ChainType.DOGE);
      });

      it("Should get chainType : BTC", async function () {
         const en = MCC.getChainType("BTC");
         expect(en).to.eq(ChainType.BTC);
      });

      it("Should get chainType : BTC", async function () {
         const en = MCC.getChainType(ChainType.BTC);
         expect(en).to.eq(ChainType.BTC);
      });

      it("Should get chainType : XRP", async function () {
         const en = MCC.getChainType("XRP");
         expect(en).to.eq(ChainType.XRP);
      });

      it("Should get chainType : RIPPLE", async function () {
         const en = MCC.getChainType("RIPPLE");
         expect(en).to.eq(ChainType.XRP);
      });

      it("Should get chainType : XRP", async function () {
         const en = MCC.getChainType(ChainType.XRP);
         expect(en).to.eq(ChainType.XRP);
      });
   });

   describe("getChainName", function () {
      it("Should get ChainTypeName : default", async function () {
         const en = MCC.getChainTypeName(ChainType.invalid);
         expect(en).to.eq("invalid");
      });

      it("Should get ChainTypeName : XRP", async function () {
         const en = MCC.getChainTypeName(ChainType.XRP);
         expect(en).to.eq("XRP");
      });

      it("Should get ChainTypeName : BTC", async function () {
         const en = MCC.getChainTypeName(ChainType.BTC);
         expect(en).to.eq("BTC");
      });

      it("Should get ChainTypeName : DOGE", async function () {
         const en = MCC.getChainTypeName(ChainType.DOGE);
         expect(en).to.eq("DOGE");
      });
   });

   describe("Client", function () {
      it("Should not initialize", async function () {
         const fn = () => {
            return MCC.Client("invalid", { url: "", password: "" });
         };
         expect(fn).to.throw(Error);
         expect(fn).to.throw("Not implemented");
      });
   });
});
