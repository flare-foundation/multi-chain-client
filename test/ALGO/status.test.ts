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

   it("Should get status state ", async function () {
      // TODO
      expect(status.state).to.eq("TODO");
   });

   it("Should get status isHealthy ", async function () {
      expect(status.isHealthy).to.eq(true);
   });

   it("Should get status isSynced ", async function () {
      expect(status.isSynced).to.eq(true);
   });
});

describe("Algo block height", function () {
   let MccClient: MCC.ALGO;

   before(async function () {
      MccClient = new MCC.ALGO(algoCreateConfig);
   });

   it("Should get bottom block height ", async function () {
      const bottom = await MccClient.getBottomBlockHeight()
      expect(bottom).to.greaterThan(19_000_000);
   });

   it("Should get block height ", async function () {
      const h = await MccClient.getBlockHeight(21_908_076);
      expect(h).to.eq(21_908_076);
   });

   it("Should get block height 2 ", async function () {
      const h = await MccClient.getBlockHeight();
      expect(h).to.greaterThan(21_908_076);
   });

   it("Should get block proof ", async function () {
      const c = await MccClient.getBlockProof(21_908_076);
      expect(c.rnd).to.eq(21_908_076);
   })
});
