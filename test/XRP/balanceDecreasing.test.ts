import { expect } from "chai";
import { MCC, standardAddressHash, traceManager } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("Balance decreasing summary tests", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   it("Should be able to extract balance decreasing", async function () {
      const tx_id = "27D592539E1FB00E8E4C4B6022729CB5559DE94AA2285AE510664A7E0891B3DB";
      const transaction = await MccClient.getTransaction(tx_id);
      const dec = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: standardAddressHash("r4s3spDTkS5xZoQujwEzbjgep3NUPTiHyq") });
      console.dir(dec, { depth: null });
   });

   // TODO: explore how this should be handled
});
