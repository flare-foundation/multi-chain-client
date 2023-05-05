import { expect } from "chai";
import { SingleBar } from "cli-progress";
import { XrpFullBlock } from "../../src/base-objects/fullBlocks/XrpFullBlock";
import { MCC, XrpBlock, XrpTransaction } from "../../src/index";
import { AddressAmountEqual, getRandomNumber, getTestFile, throwOrReturnSameGetter } from "../testUtils";

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
               expect(transaction.fee.toNumber()).to.eq(transObject.fee.toNumber());
               expect(AddressAmountEqual(transaction.spentAmounts, transObject.spentAmounts)).to.eq(true);
               expect(AddressAmountEqual(transaction.receivedAmounts, transObject.receivedAmounts)).to.eq(true);
               // expect(AddressAmountEqual(transaction.intendedReceivedAmounts, transObject.intendedReceivedAmounts)).to.eq(true);
               // expect(AddressAmountEqual(transaction.intendedSpendAmounts, transObject.intendedSpendAmounts)).to.eq(true);
               throwOrReturnSameGetter(transaction, transObject, "intendedReceivedAmounts");
               throwOrReturnSameGetter(transaction, transObject, "intendedSpendAmounts");
               // TODO: Uncomment when asset transactions are supported
               //  expect(AddressAmountEqual(transaction.assetSpentAmounts, transObject.assetSpentAmounts)).to.eq(true);
               //  expect(AddressAmountEqual(transaction.assetReceivedAmounts, transObject.assetReceivedAmounts)).to.eq(true);
               expect(transaction.type).to.eq(transObject.type);
               expect(transaction.isNativePayment).to.eq(transObject.isNativePayment);
               expect(transaction.currencyName).to.eq(transObject.currencyName);
               expect(transaction.elementaryUnits.toNumber()).to.eq(transObject.elementaryUnits.toNumber());
            }
            b1.stop();
         });
      });
   }
});
