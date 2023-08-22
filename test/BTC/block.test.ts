import { expect } from "chai";
import { BtcBlock, MCC, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const BtcMccConnection = {
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Block Btc base test ${getTestFile(__filename)}`, function () {
    let MccClient: MCC.BTC;
    let block: BtcBlock;
    const blockNumber = 729_409;

    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
        block = await MccClient.getBlock(blockNumber);
    });

    it("Should get block", async function () {
        expect(block).to.not.eq(undefined);
    });

    it("Should get block number ", async function () {
        expect(block.number).to.eq(blockNumber);
    });

    it("Should get block hash ", async function () {
        expect(block.blockHash).to.eq("00000000000000000002579f72f3f80f68b02767c44024d697826af787776b58");
    });

    it("Should get block standard hash ", async function () {
        expect(block.stdBlockHash).to.eq("00000000000000000002579f72f3f80f68b02767c44024d697826af787776b58");
    });

    it("Should get previous block hash ", async function () {
        expect(block.previousBlockHash).to.eq("000000000000000000007ee33acfbaa658c2d3c2c217b89e0f515d01a2a273c3");
    });

    it("Should get previous block standard hash ", async function () {
        expect(block.stdPreviousBlockHash).to.eq("000000000000000000007ee33acfbaa658c2d3c2c217b89e0f515d01a2a273c3");
    });

    it("Should get block timestamp ", async function () {
        expect(block.unixTimestamp).to.eq(1648480352);
    });

    it("Should get transaction ids ", async function () {
        expect(block.transactionIds.length).to.eq(565);
        expect(block.transactionIds).contain("0x77f4598116882ddc5dab96967bead585a2a4b992e663bdb6cd0311a31967696c");
        expect(block.transactionIds).contain("0x3f16a95126783d04c4494211c442a5982ae8ab08733df68d26ceed9514ddb147");
    });

    it("Should get transaction standard ids ", async function () {
        expect(block.stdTransactionIds.length).to.eq(565);
    });

    it("Should get transaction count ", async function () {
        expect(block.transactionCount).to.eq(565);
    });

    it("Should not get block if invalid input", async () => {
        await expect(MccClient.getBlock(blockNumber.toString())).to.eventually.be.rejected;
    });
});
