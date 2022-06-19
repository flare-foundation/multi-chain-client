import { expect } from "chai";
import { MCC, XrpNodeStatus } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
};

describe("Block Xrp base test ", function () {
   let MccClient: MCC.XRP;
   let status: XrpNodeStatus;

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
      status = await MccClient.getNodeStatus();
   });

   it("Should get status version ", async function () {
      const version = status.version.split("_");
      expect(version[0]).to.be.eq("1.9.1");
   });

   it("Should get status state ", async function () {
      expect(status.state).to.be.eq("full");
   });

   it("Should get status isHealthy ", async function () {
      expect(status.isHealthy).to.eq(true);
   });

   it("Should get status isSynced ", async function () {
      expect(status.isSynced).to.eq(true);
   });
});
