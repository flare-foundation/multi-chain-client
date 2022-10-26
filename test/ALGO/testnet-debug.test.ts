import { AlgoBlock, base64ToHex, hexToBase32, MCC, traceManager } from "../../src";
const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
chai.use(require("chai-as-promised"));

// const algoCreateConfig = {
//    algod: {
//       url: process.env.ALGO_ALGOD_URL_TESTNET || "",
//       token: process.env.ALGO_ALGOD_TOKEN_TESTNET || "",
//    },
// };

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
};

describe(`Algo`, async () => {
   it("Transaction bigint", async function () {
      traceManager.displayStateOnException = false;
      const MccClient = new MCC.ALGO(algoCreateConfig);
      const block = await MccClient.getBlock(24940749);

      console.log(block);
      for (let data of block.transactionObjects) {
         console.log(data);
         await data.makeFull(MccClient);
         console.log(data);
      }
   });
});
