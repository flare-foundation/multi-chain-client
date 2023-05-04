import { expect } from "chai";
import { SingleBar } from "cli-progress";
import { BtcBlock, BtcFullBlock, MCC, UtxoMccCreate, traceManager } from "../../src/index";
import { AddressAmountEqual, getRandomNumber, getTestFile, throwOrReturnSameGetter } from "../testUtils";

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
            expect(transactions.length).to.be.greaterThan(0);
            let i = 0;
            const checkFirsN = 500;
            const b1 = new SingleBar({
               format: `|| {bar} || Checking block || {percentage}% || {value}/{total} Transactions`,
               barCompleteChar: "\u2588",
               barIncompleteChar: "\u2591",
               hideCursor: true,
            });
            b1.start(checkFirsN, 0);
            for (const transaction of transactions) {
               b1.update(i);
               i++;
               if (i > checkFirsN) {
                  return;
               }
               const transObject = await client.getTransaction(transaction.txid);

               expect(transaction.txid).to.eq(transObject.txid);
               expect(transaction.stdTxid).to.eq(transObject.stdTxid);
               expect(transaction.hash).to.eq(transObject.hash);
               expect(transaction.reference.sort()).to.deep.eq(transObject.reference.sort());
               expect(transaction.stdPaymentReference).to.eq(transObject.stdPaymentReference);
               expect(transaction.unixTimestamp).to.eq(transObject.unixTimestamp);
               expect(transaction.sourceAddresses.sort()).to.deep.eq(transObject.sourceAddresses.sort());
               expect(transaction.receivingAddresses.sort()).to.deep.eq(transObject.receivingAddresses.sort());
               // TODO: Uncomment when asset transactions are supported
               //  expect(transaction.assetSourceAddresses.sort()).to.deep.eq(transObject.sourceAddresses.sort());
               //  expect(transaction.assetReceivingAddresses.sort()).to.deep.eq(transObject.receivingAddresses.sort());
               // expect(transaction.fee.toNumber()).to.eq(transObject.fee.toNumber());
               expect(AddressAmountEqual(transaction.spentAmounts, transObject.spentAmounts)).to.eq(true);
               expect(AddressAmountEqual(transaction.receivedAmounts, transObject.receivedAmounts)).to.eq(true);

               // expect(transaction.intendedReceivedAmounts).to.deep.eq(transObject.intendedReceivedAmounts)
               throwOrReturnSameGetter(transaction, transObject, "intendedReceivedAmounts");
               throwOrReturnSameGetter(transaction, transObject, "intendedSpendAmounts");

               // expect(AddressAmountEqual(transaction.intendedReceivedAmounts, transObject.intendedReceivedAmounts)).to.eq(true);

               // expect(AddressAmountEqual(transaction.intendedSpendAmounts, transObject.intendedSpendAmounts)).to.eq(true);
               // TODO: Uncomment when asset transactions are supported
               //  expect(AddressAmountEqual(transaction.assetSpentAmounts, transObject.assetSpentAmounts)).to.eq(true);
               //  expect(AddressAmountEqual(transaction.assetReceivedAmounts, transObject.assetReceivedAmounts)).to.eq(true);
               expect(transaction.type).to.eq(transObject.type);
               expect(transaction.isNativePayment).to.eq(transObject.isNativePayment);
               expect(transaction.currencyName).to.eq(transObject.currencyName);
               expect(transaction.elementaryUnits.toNumber()).to.eq(transObject.elementaryUnits.toNumber());
            }
         }).timeout(1000 * 60 * 15);
      });
   }
});
