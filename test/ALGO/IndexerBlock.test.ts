import { MCC } from "../../src";
import { AlgoIndexerBlock } from "../../src/base-objects/blocks/AlgoIndexerBlock";
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

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
    let MccClient: MCC.ALGO;
    let block: AlgoIndexerBlock;

    before(async function () {
        MccClient = new MCC.ALGO(algoCreateConfig);
        let tblock = await MccClient.getIndexerBlock(19_000_000);
        if (tblock !== null) {
            block = tblock;
        }
    });

    it("Should get transaction ids - no data", async function () {
        delete block.data.transactions![0].id;
        block.transactionIds;
        expect(block.transactionIds.length).greaterThanOrEqual(0);
     });

    it("Should get transactions - no data", async function () {
        delete block.data.transactions;
        expect(block.transactionIds.length).to.eq(0);
     });

     it("Should count transactions - no data", async function () {
        expect(block.transactionCount).to.eq(0);
     });

     it("Should get indexer block - no input", async function () {
        let tblock = await MccClient.getIndexerBlock();
        expect(tblock).is.not.null;
     });

     it("Should not get indexer block - invalid", async function () {
        await expect(MccClient.getIndexerBlock(Number.MAX_SAFE_INTEGER)).to.be.rejectedWith("InvalidBlock");
     });
});