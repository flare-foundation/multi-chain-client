import { expect } from "chai";
import { SingleBar } from "cli-progress";
import { BtcBlock, BtcFullBlock, MCC, UtxoMccCreate, traceManager } from "../../src/index";
import {
    GETTERS_AMOUNTS,
    GETTERS_BASIC,
    GETTERS_BN,
    GETTERS_LISTS,
    getRandomNumber,
    getTestFile,
    throwOrReturnSameGetter,
    throwOrReturnSameGetterAmounts,
    throwOrReturnSameGetterBN,
    throwOrReturnSameGetterList,
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
                expect(transactions.length).to.be.greaterThan(0);
                const sampling_size = 10;
                const b1 = new SingleBar({
                    format: `|| {bar} || Checking block || {percentage}% || {value}/{total} Transactions`,
                    barCompleteChar: "\u2588",
                    barIncompleteChar: "\u2591",
                    hideCursor: true,
                });
                b1.start(Math.min(transactions.length, sampling_size), 0);
                let i = 0;

                while (i < sampling_size) {
                    const randomIndex = Math.floor(transactions.length * Math.random());
                    const transaction = transactions[randomIndex];
                    i++;

                    b1.increment();
                    const transObject = await client.getTransaction(transaction.txid);

                    for (const getter of GETTERS_BASIC) {
                        throwOrReturnSameGetter(transaction, transObject, getter);
                    }

                    for (const getter of GETTERS_LISTS) {
                        throwOrReturnSameGetterList(transaction, transObject, getter);
                    }

                    //Find why the error is logged
                    for (const getter of GETTERS_BN) {
                        throwOrReturnSameGetterBN(transaction, transObject, getter);
                    }

                    for (const getter of GETTERS_AMOUNTS) {
                        throwOrReturnSameGetterAmounts(transaction, transObject, getter);
                    }
                }
                b1.stop();
            });
        });
    }
});
