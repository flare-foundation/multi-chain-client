import { expect } from "chai";
import { AlgoBlock, MCC } from "../../src";
import { AlgoIndexerBlock } from "../../src/base-objects/blocks/AlgoIndexerBlock";

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

describe(`Algo block from algod and indexer compare`, async () => {
   const checkBlocks = [21_374_440, 21_400_000, 21_500_000, 21_600_000, 21_700_000, 21_797_543, 21_800_000, 21_900_000, 21_931_716];
   let MccClient: MCC.ALGO;
   before(async function () {
      MccClient = new MCC.ALGO(algoCreateConfig);
   });

   for (let hei of checkBlocks) {
      describe(`Compare block from indexer and algod ${hei}`, function () {
         let block: AlgoBlock;
         let IBlock: AlgoIndexerBlock;

         before(async function () {
            IBlock = await MccClient.getIndexerBlock(hei);
            block = await MccClient.getBlock(hei);
         });

         it("Should compare block number ", async function () {
            expect(block.number).to.eq(IBlock.number);
         });

         it("Should compare block hash ", async function () {
            expect(block.blockHash).to.eq(IBlock.blockHash);
         });

         it("Should compare block standard hash ", async function () {
            expect(block.stdBlockHash).to.eq(IBlock.stdBlockHash);
         });

         it("Should compare block timestamp ", async function () {
            expect(block.unixTimestamp).to.eq(IBlock.unixTimestamp);
         });

         it("Should compare transaction ids ", async function () {
            let diffs = 0;
            let trans1 = block.transactionIds;
            const trans2 = IBlock.transactionIds;

            expect(trans1.length).to.eq(trans2.length);
            let allSame = true;
            for (let i = 0; i < trans2.length; i++) {
               const found = trans1.find((elem) => trans2[i] === elem);
               if (found) {
                  trans1 = trans1.filter((elem) => !(found === elem));
               } else {
                  // transaction was not found
                  diffs += 1;
                  const indexTr = await MccClient.getIndexerTransaction(trans2[i]);
                  allSame = false;
               }
            }
            if (!allSame) {
               console.log("diffs: ", diffs);
            }
            expect(allSame).to.eq(true);
         });

         it("Should compare transaction standard ids ", async function () {
            let diffs = 0;
            const trans1 = block.stdTransactionIds;
            const trans2 = IBlock.stdTransactionIds;

            expect(trans1.length).to.eq(trans2.length);
            let allSame = true;
            for (let i = 0; i < trans2.length; i++) {
               // find all transaction ids in indexer block, and if not print them out
               const found = trans1.find((elem) => trans2[i] === elem);
               if (found) {
               } else {
                  // transaction was not found
                  diffs += 1;
                  allSame = false;
               }
            }
            if (!allSame) {
               console.log("diffs: ", diffs);
            }
            expect(allSame).to.eq(true);
         });

         it("Should compare transaction count ", async function () {
            expect(block.transactionCount).to.eq(IBlock.transactionCount);
         });
      });
   }
});
