import { expect } from "chai";
import { AlgoNodeStatus, MCC } from "../../src";

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
};

describe("Algo Node Status tests (LIFE: expect healthy) ", function () {
   let MccClient: MCC.ALGO;
   let status: AlgoNodeStatus;

   before(async function () {
      MccClient = new MCC.ALGO(algoCreateConfig);
      const tStatus = await MccClient.getNodeStatus();
      if (tStatus) {
         status = tStatus;
      }
   });

   it("Should get status version ", async function () {
      const version = status.version.split("_");
      expect(version[0]).to.be.eq("3");
   });

   it.skip("Should get status state ", async function () {
      console.log(status.state);
   });

   it("Should get status isHealthy ", async function () {
      // console.log(status.isHealthy);
      expect(status.isHealthy).to.eq(true);
   });

   it("Should get status isSynced ", async function () {
      // console.log(status.isSynced);
      expect(status.isSynced).to.eq(true);
   });
});
