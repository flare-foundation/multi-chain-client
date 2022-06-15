import { AlgoNodeStatus, MCC } from "../../src";

// const algoCreateConfig = {
//    algod: {
//       url: process.env.ALGO_ALGOD_URL || "",
//       token: process.env.ALGO_ALGOD_TOKEN || "",
//    },
//    indexer: {
//       url: process.env.ALGO_INDEXER_URL || "",
//       token: process.env.ALGO_INDEXER_TOKEN || "",
//    },
// };

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL_TEST || "",
      token: process.env.ALGO_ALGOD_TOKEN_TEST || "",
   },
   indexer: {
      url: process.env.ALGO_INDEXER_URL || "",
      token: process.env.ALGO_INDEXER_TOKEN || "",
   },
};

describe("Block Algo base test ", function () {
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

});
