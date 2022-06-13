import { MCC } from "../../src/index";
import { expect } from "chai";

const public_url = "https://s1.ripple.com:51234";
const testnet_url = "https://s.altnet.rippletest.net:51234";
const devnet_url = "https://s.devnet.rippletest.net:51234";

describe("XRP ripple client tests", () => {
   it.skip("should be able to connect", () => {});

   it(`should get block height from public network`, async function () {
      const XRP = new MCC.XRP({ url: public_url });
      let a = await XRP.getBlockHeight();

      expect(a).to.greaterThan(68100602);
   });

   it(`should get block height from testnet network`, async function () {
      const XRP = new MCC.XRP({ url: public_url });
      let a = await XRP.getBlockHeight();

      expect(a).to.greaterThan(0);
   });

   it(`should get block height from devnet network`, async function () {
      const XRP = new MCC.XRP({ url: public_url });
      let a = await XRP.getBlockHeight();

      expect(a).to.greaterThan(0);
   });

   it("should check if healthy", async function () {
      const XRP = new MCC.XRP({ url: public_url });
      let res = await XRP.isHealthy();

      console.log(res);

      expect(res).to.eq(true);
   });

   describe(`Public XRP ripple client tests`, () => {
      it("should get tx data for existing tx", async function () {
         const XRP = new MCC.XRP({ url: public_url });

         const txhash = "D3F5C55522412EBE249061AC32E2390561B9511CEED4B173826B95E850F9947A";

         let res = await XRP.getTransaction(txhash, { binary: false });

         console.log(res);
      });
   });
});
