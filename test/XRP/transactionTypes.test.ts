import { expect } from "chai";
import { MCC, traceManager } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("XRP Transaction Types", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   it("should support transaction of type Payment", async function () {
      const trans = await MccClient.getTransaction("327FD263132A4D08170E1B01FE1BB2E21D0126CE58165C97A9173CA9551BCD70");
      console.log(trans.type);
   });
});
