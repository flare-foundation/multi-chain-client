import { MCC } from "../../src/index";
import { expect } from "chai";

const public_url = "https://s1.ripple.com:51234";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
};

describe("XRP ripple client tests", () => {
   describe("Should initialize", function () {
      it("Direct initialize", async function () {
         const client = new MCC.XRP(XRPMccConnection);
         expect(client).to.not.eq(null);
      });

      it("Client initialize", async function () {
         const client = MCC.Client("XRP", XRPMccConnection);
         expect(client).to.not.eq(null);
      });
   });

   it(`should get block height from public network`, async function () {
      const XRP = new MCC.XRP({ url: public_url });
      const a = await XRP.getBlockHeight();
      expect(a).to.greaterThan(68100602);
   });

   it(`should get block height from testnet network`, async function () {
      const XRP = new MCC.XRP({ url: public_url });
      const a = await XRP.getBlockHeight();
      expect(a).to.greaterThan(0);
   });

   it(`should get block height from devnet network`, async function () {
      const XRP = new MCC.XRP({ url: public_url });
      const a = await XRP.getBlockHeight();
      expect(a).to.greaterThan(0);
   });
});
