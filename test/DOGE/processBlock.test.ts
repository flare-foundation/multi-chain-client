import { expect } from "chai";
import { DogeFullBlock, MCC, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Block DOGE process (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.DOGE;

    const blockHeight = 4858845;

    before(async function () {
        MccClient = new MCC.DOGE(DogeMccConnection);
    });

    it("Should get block and check its height ", async function () {
        const block = await MccClient.getBlock(blockHeight);
        expect(block.number).to.eq(blockHeight);
    });

    describe(`Processing transactions `, function () {
        let block: DogeFullBlock;

        before(async function () {
            block = await MccClient.getFullBlock(blockHeight);
        });

        it("Should process all transactions ", async function () {
            let coinbase_indicator = true;
            for (const txid of block.transactionIds) {
                const tx = await MccClient.getTransaction(txid);
                await tx.makeFull((tid: string) => MccClient.getTransaction(tid));

                if (coinbase_indicator) {
                    expect(tx.type).to.eq("coinbase");
                    coinbase_indicator = false;
                } else {
                    expect(tx.type).to.eq("full_payment");
                }
            }
        });
    });
});
