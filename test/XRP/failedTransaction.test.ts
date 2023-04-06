import { expect } from "chai";
import { MCC, traceManager } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("Should correctly process Failed transactions", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   it("Should correctly parse failed transaction", async function () {
      const tx_id = "1EB2504C2632414C110D74EE2A1E9357CE2845672D2FEB5BC79160AB25067A8D";
      const transaction = await MccClient.getTransaction(tx_id);
      expect(transaction.txid).to.eq(tx_id);
   });

   // TODO: explore how this should be handled
});
