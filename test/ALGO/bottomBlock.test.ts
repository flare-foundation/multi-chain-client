import { AlgoBlock, base64ToHex, hexToBase32, MCC, traceManager } from "../../src";
const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
chai.use(require("chai-as-promised"));

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
};

describe(`Algo bottom block`, async () => {
   it("Should get bottom block", async function () {
      traceManager.displayStateOnException = false;
      const MccClient = new MCC.ALGO(algoCreateConfig);
      const height = await MccClient.getBlockHeight();

      const block = await MccClient.getBottomBlockHeight();

      expect(height - block).to.be.at.least(900);
   });
});
