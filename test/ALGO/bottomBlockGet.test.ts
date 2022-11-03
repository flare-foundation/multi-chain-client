import { expect } from "chai";
import { MCC, traceManager } from "../../src";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe(`Algo bottom block`, async () => {
   it("Should get bottom block", async function () {
      traceManager.displayStateOnException = false;
      const MccClient = new MCC.ALGO(algoCreateConfig);
      // const height = await MccClient.getBlockHeight();

      const bottomBlockHeight = await MccClient.getBottomBlockHeight();

      console.log(bottomBlockHeight);

      const bottomBlock = await MccClient.getBlock(bottomBlockHeight);
      console.log(bottomBlock);
   });
});
