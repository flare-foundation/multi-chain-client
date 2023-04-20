import { expect } from "chai";
import { MCC, UtxoMccCreate } from "../../src";

const BtcMccConnection = {
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe("Chain tips test ", function () {
   let MccClient: MCC.BTC;
   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   it("Should detect balance decreasing for 8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684", async function () {
      const transaction = await MccClient.getTransaction("8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684");
      const dec = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: "0x00", client: MccClient });
      console.dir(dec, { depth: null });
      expect(dec.status).to.eq("success");
   });
});
