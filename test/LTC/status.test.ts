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
      console.log(status.version);
   });

   it("Should get status state ", async function () {
      console.log(status.state);
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
