import { AlgoBlock, MCC } from "../../src";

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

describe(`Algo block processing`, async () => {
   describe("Classic block test ", function () {
      let MccClient: MCC.ALGO;
      let block: AlgoBlock;

      before(async function () {
         MccClient = new MCC.ALGO(algoCreateConfig);
         block = await MccClient.getBlock(21_374_440);

         console.log("We have block");
         
      });

      it.only("Should get block number ", async function () {
         console.log(block.number);
      });

      it("Should get block hash ", async function () {
         console.log(block.blockHash);
      });

      it("Should get block standard hash ", async function () {
         console.log(block.stdBlockHash);
      });

      it("Should get block timestamp ", async function () {
         console.log(block.unixTimestamp);
      });

      it("Should get transaction ids ", async function () {
         console.log(block.transactionIds);
      });

      it("Should get transaction standard ids ", async function () {
         console.log(block.stdTransactionIds);
      });

      it("Should get transaction count ", async function () {
         console.log(block.transactionCount);
      });
   });
});
