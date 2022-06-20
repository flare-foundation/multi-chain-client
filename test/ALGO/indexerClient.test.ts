import { expect } from "chai";
import { MCC } from "../../src";

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
   indexer: {
      url: process.env.ALGO_INDEXER_URL || "",
      token: process.env.ALGO_INDEXER_TOKEN || "",
   },
};

describe(`Algo indexer client`, async () => {
   it("Should connect to indexer ", async function () {
      const MccClient = new MCC.ALGO(algoCreateConfig);
      expect(MccClient).to.not.eq(null);
   });

   it("Should connect to as reg test ", async function () {
      const MccClient = new MCC.ALGO({ inRegTest: true, ...algoCreateConfig });
      expect(MccClient).to.not.eq(null);
   });
});
