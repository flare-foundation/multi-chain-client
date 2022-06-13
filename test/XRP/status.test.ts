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
      const tStatus = await MccClient.getNodeStatus();
      if (tStatus) {
         status = tStatus;
      }
   });

   it("Should get status version ", async function () {
      console.log(status.version);
   });

   it("Should get status state ", async function () {
      console.log(status.state);
   });

   it("Should get bottom Block ", async function () {
      console.log(status.bottomBlock);
   });

   it("Should get status isHealthy ", async function () {
      console.log(status.isHealthy);
   });

   it("Should get status isSynced ", async function () {
      console.log(status.isSynced);
   });

   it("Should get full data ", async function () {
      console.log(status.data);
   });
});
