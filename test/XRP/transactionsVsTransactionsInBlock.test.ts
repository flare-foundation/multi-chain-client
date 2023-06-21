import { expect } from "chai";
import { SingleBar } from "cli-progress";
import { XrpFullBlock } from "../../src/base-objects/fullBlocks/XrpFullBlock";
import { MCC } from "../../src/index";
import {
   GETTERS_BASIC,
   GETTERS_LISTS,
   getRandomNumber,
   getTestFile,
   throwOrReturnSameGetter,
   throwOrReturnSameGetterList,
   throwOrReturnSameGetterBN,
   GETTERS_AMOUNTS,
   throwOrReturnSameGetterAmounts,
   GETTERS_BN,
} from "../testUtils";
import { XrpBlock } from "../../src/base-objects";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe(`XRP transactions in full block vs transactions from getTransaction (${getTestFile(__filename)})`, () => {
   const blockNumbersToCheck = [75798761, getRandomNumber(70000000, 79362506)];

   for (const blockNumber of blockNumbersToCheck) {
      describe(`Testing transactions in block ${blockNumber} (transitions from full block vs )`, () => {
         let client: MCC.XRP;
         let block: XrpBlock;
         let fullBlock: XrpFullBlock;

         before(async () => {
            client = new MCC.XRP(XRPMccConnection);
            block = await client.getBlock(blockNumber);
            fullBlock = await client.getFullBlock(blockNumber);
         });

         it("Block and Full block transaction count should be equal", () => {
            expect(block.transactionCount).to.eq(fullBlock.transactionCount);
         });

         it("Block and Full block transaction ids should be equal", () => {
            expect(block.transactionIds.sort()).to.deep.eq(fullBlock.transactionIds.sort());
         });

         it("Iterating over transactions", async () => {
            const transactions = fullBlock.transactions;
            const b1 = new SingleBar({
               format: `|| {bar} || Checking block || {percentage}% || {value}/{total} Transactions`,
               barCompleteChar: "\u2588",
               barIncompleteChar: "\u2591",
               hideCursor: true,
            });
            b1.start(transactions.length, 0);
            expect(transactions.length).to.be.greaterThan(0);
            let i = 0;

            for (const transaction of transactions) {
               i++;
               // if (i != 83) {
               //    continue;
               // }
               b1.increment();
               const transObject = await client.getTransaction(transaction.txid);

               for (const getter of GETTERS_BASIC) {
                  throwOrReturnSameGetter(transaction, transObject, getter);
               }

               for (const getter of GETTERS_LISTS) {
                  throwOrReturnSameGetterList(transaction, transObject, getter);
               }

               for (const getter of GETTERS_AMOUNTS) {
                  throwOrReturnSameGetterAmounts(transaction, transObject, getter);
               }

               for (const getter of GETTERS_BN) {
                  throwOrReturnSameGetterBN(transaction, transObject, getter);
               }
            }
            b1.stop();
         });
      });
   }
});
