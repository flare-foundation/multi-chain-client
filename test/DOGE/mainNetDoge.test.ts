import { expect } from "chai";
import { MCC, retry, traceManager, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`DOGE mainnet client tests ,(${getTestFile(__filename)})`, () => {
    before(async function () {
        this.timeout(10000); // set timeout to 10 sec from 2 sec
        traceManager.displayStateOnException = false;
    });

    describe("Should initialize", function () {
        it("Direct initialize", async function () {
            const client = new MCC.DOGE(DogeMccConnection);
            expect(client).to.not.eq(null);
        });

        it("Client initialize", async function () {
            const client = MCC.Client("DOGE", DogeMccConnection);
            expect(client).to.not.eq(null);
        });
    });

    describe("get transaction tests", function () {
        it("should get transaction ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const txid = "2d906dbce50eb47567d1decae6a0ce5267eaabe56838ea9fd700a732bbcdcb3b";
            const trans = await RPC.getTransaction(txid);
            if (trans) {
                expect(trans.txid).to.eq(txid);
            }
        });

        it("should return null if transaction does not exist ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const txid = "2d906dbce50eb47567d1decae6a0ce5267eaabe56838ea9fd700a732bbcdcbff";
            const trans = RPC.getTransaction(txid);
            await expect(trans).to.be.rejectedWith("InvalidTransaction");
        });

        it("should be able to get block height ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const blockHeight = await RPC.getBlockHeight();
            expect(blockHeight).to.be.above(0);
        });

        it("should be able to get block height ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const blockHeight = await RPC.getBlockHeight();
            expect(blockHeight).to.be.above(0);
        });

        it("should be able to get block header from height ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const height = 4103881;
            const blockHeader = await RPC.getBlockHeaderBase(height);
            expect(blockHeader).to.not.eq(null);
        });

        it("should be able to get block header from hash ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const hash = "8ea32399901c056e32c0fef84208bc257824f6718a6d4906ab00833b8d87ea89";
            const blockHeader = await RPC.getBlockHeaderBase(hash);
            expect(blockHeader).to.not.eq(null);
        });

        it("should be able to get block from height ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const height = 4103881;
            const blockHeader = await RPC.getBlock(height);
            expect(blockHeader).to.not.eq(null);
        });

        it("should be able to get block from hash ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const hash = "8ea32399901c056e32c0fef84208bc257824f6718a6d4906ab00833b8d87ea89";
            const blockHeader = await RPC.getBlock(hash);
            expect(blockHeader).to.not.eq(null);
        });

        it("should get full transaction ", async function () {
            const RPC = new MCC.DOGE(DogeMccConnection);
            const txid = "2d906dbce50eb47567d1decae6a0ce5267eaabe56838ea9fd700a732bbcdcb3b";
            const trans = await RPC.getTransaction(txid);
            if (trans) {
                expect(trans.txid).to.eq(txid);
            }
        });
    });

    // describe("Doge ChainTips", async function () {
    //     it("basic chaintips ", async function () {
    //         const DogeRpc = new MCC.DOGE(DogeMccConnection);
    //         const chaintips = await retry("", () => DogeRpc.getTopBlocks());
    //         expect(chaintips.length).to.greaterThanOrEqual(46);
    //     });

    //     it("full chaintips with all blocks ", async function () {
    //         const DogeRpc = new MCC.DOGE(DogeMccConnection);
    //         const chaintips = await retry("", () => DogeRpc.getTopBlocks({ all_blocks: true }));
    //         expect(chaintips.length).to.greaterThanOrEqual(46);
    //     });

    //     it("chaintips after block 4_133_821 ", async function () {
    //         const DogeRpc = new MCC.DOGE(DogeMccConnection);
    //         const chaintips = await retry("", () => DogeRpc.getTopBlocks({ height_gte: 4_133_821 }));
    //         expect(chaintips.length).to.greaterThanOrEqual(46);
    //     });
    // });
});
