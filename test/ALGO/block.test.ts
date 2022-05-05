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
      let block2: AlgoBlock;
      before(async function () {
         MccClient = new MCC.ALGO(algoCreateConfig);
         let tblock = await MccClient.getBlock(19_000_000);
         let tblock2 = await MccClient.getBlock(19_000_001);
         if (tblock !== null) {
            block = tblock;
         }
         if (tblock2 !== null) {
            block2 = tblock2;
         }
      });

      it("Should get block number ", async function () {
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

   describe("Classic block test ", function () {
      let MccClient: MCC.ALGO;
      let block: AlgoBlock;

      before(async function () {
         MccClient = new MCC.ALGO(algoCreateConfig);
         const currHeight = await MccClient.getBlockHeight();
         console.log(currHeight);

         let tblock = await MccClient.getBlock(20_617_234);

         if (tblock !== null) {
            block = tblock;
         }
      });

      it("Should get block number ", async function () {
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
