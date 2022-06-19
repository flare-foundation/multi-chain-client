import { expect } from "chai";
import { MCC, UtxoMccCreate, UtxoNodeStatus, XrpNodeStatus } from "../../src";

const BtcMccConnection = {
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Block BTC base test ", function () {
   let MccClient: MCC.BTC;
   let status: UtxoNodeStatus;

   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
      const tstatus = await MccClient.getNodeStatus();
      if (tstatus) {
         status = tstatus;
      }
   });

   it("Should get status version ", async function () {
      const version = status.version.split("_");
      expect(version[0]).to.be.eq("210200");
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

describe("BTC bottom block ", function () {
   let MccClient: MCC.BTC;

   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   it("Should get status version ", async function () {
      const bottom = await MccClient.getBottomBlockHeight()
      expect(bottom).to.eq(0);
   });
});