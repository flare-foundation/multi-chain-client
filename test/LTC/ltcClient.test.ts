import { MCC, UtxoMccCreate } from "../../src/index";
import { expect } from "chai";

const LtcMccConnection = {
   url: process.env.LTC_URL || "",
   username: process.env.LTC_USERNAME || "",
   password: process.env.LTC_PASSWORD || "",
} as UtxoMccCreate;

describe("LTC client tests", () => {
   describe("Should initialize", function () {
      it("Direct initialize", async function () {
         const client = new MCC.LTC(LtcMccConnection);
         expect(client).to.not.eq(null);
      });

      it("Client initialize", async function () {
         const client = MCC.Client("LTC", LtcMccConnection);
         expect(client).to.not.eq(null);
      });
   });

   describe("General functionalities", function () {
      it("should get block height from regtest network", async function () {
         const DogeRpc = new MCC.LTC(LtcMccConnection);
         const a = await DogeRpc.getBlockHeight();

         expect(a).to.greaterThan(100);
      });
   });
});
