import { expect } from "chai";
import { SingleBar } from "cli-progress";
import { BtcBlock, BtcFullBlock, MCC, UtxoMccCreate, traceManager } from "../../src/index";
import {
   AddressAmountEqual,
   GETTERS_BASIC,
   GETTERS_LISTS,
   getRandomNumber,
   getTestFile,
   throwOrReturnSameGetter,
   throwOrReturnSameGetterList,
   throwOrReturnSameGetterBN,
   GETTERS_AMOUNTS,
   throwOrReturnSameGetterAmounts,
} from "../testUtils";

const BtcMccConnection = {
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`BTC transactions in full block vs transactions from getTransaction (${getTestFile(__filename)})`, () => {
   const blockNumbersToCheck = [getRandomNumber(100000, 787000)];

   for (const blockNumber of blockNumbersToCheck) {
      describe(`Testing transactions in block ${blockNumber} (transitions from full block vs )`, () => {
         let client: MCC.BTC;
         let block: BtcBlock;
         let fullBlock: BtcFullBlock;
         before(async () => {
            client = new MCC.BTC(BtcMccConnection);
            block = await client.getBlock(blockNumber);
            fullBlock = (await client.getFullBlock(blockNumber)) as BtcFullBlock;
            traceManager.displayStateOnException = false;
            traceManager.displayRuntimeTrace = false;
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

               // for (const getter of GETTERS_BN) {
               //    throwOrReturnSameGetterBN(transaction, transObject, getter);
               // }

               for (const getter of GETTERS_AMOUNTS) {
                  throwOrReturnSameGetterAmounts(transaction, transObject, getter);
               }
            }
            b1.stop();
         });
      });
   }
});
