import { expect } from "chai";
import { MCC, UtxoMccCreate, UtxoNodeStatus } from "../../src";

const LtcMccConnection = {
   url: process.env.LTC_URL || "",
   username: process.env.LTC_USERNAME || "",
   password: process.env.LTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Block LTC base test ", function () {
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

describe("LTC bottom block ", function () {
   let MccClient: MCC.LTC;

   before(async function () {
      MccClient = new MCC.LTC(LtcMccConnection);
   });

   it("Should get status version ", async function () {
      const bottom = await MccClient.getBottomBlockHeight()
      expect(bottom).to.eq(0);
   });
});