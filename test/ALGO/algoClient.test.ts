import { expect } from "chai";
import { MCC } from "../../src";

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe(`Algo algod client`, async () => {
   describe("Should initialize", function () {
      it("Direct initialize", async function () {
         const client = new MCC.ALGO(algoCreateConfig);
         expect(client).to.not.eq(null);
      });

      it("Client initialize", async function () {
         const client = MCC.Client("ALGO", algoCreateConfig);
         expect(client).to.not.eq(null);
      });
   });
});
