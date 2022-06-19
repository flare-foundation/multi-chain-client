import { expect } from "chai";
import { MCC, UtxoMccCreate, UtxoNodeStatus, XrpNodeStatus } from "../../src";

const LtcMccConnection = {
   url: process.env.LTC_URL || "",
   username: process.env.LTC_USERNAME || "",
   password: process.env.LTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Block BTC base test ", function () {
   let MccClient: MCC.LTC;
   let status: UtxoNodeStatus;

   before(async function () {
      MccClient = new MCC.LTC(LtcMccConnection);
      const tstatus = await MccClient.getNodeStatus();
      if (tstatus) {
         status = tstatus;
      }
   });

   it("Should get status version ", async function () {
      const version = status.version.split("_");
      expect(version[0]).to.be.eq("180100");
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
