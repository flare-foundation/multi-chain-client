import { MCC } from "../../src/index";
import { expect } from "chai";

const public_url = "https://s1.ripple.com:51234";
const testnet_url = "https://s.altnet.rippletest.net:51234";
const devnet_url = "https://s.devnet.rippletest.net:51234";

describe("XRP ripple client tests", () => {
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
});
