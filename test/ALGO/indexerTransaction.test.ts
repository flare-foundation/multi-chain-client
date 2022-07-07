import { BlockList } from "net";
import { AlgoBlock, AlgoTransaction, MCC, toBN, TransactionSuccessStatus } from "../../src";
import { AlgoIndexerBlock } from "../../src/base-objects/blocks/AlgoIndexerBlock";
import { AlgoIndexerTransaction } from "../../src/base-objects/transactions/AlgoIndexerTransaction";
import { algoTransactionTestCases } from "../testUtils";
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
    const checkBlocks = [21_700_000, 21_797_543];
    let MccClient: MCC.ALGO;
    let block1: AlgoBlock;
    let BTrans1: AlgoTransaction;
    let ITrans1: AlgoIndexerTransaction;
    let block2: AlgoBlock;
    let BTrans2: AlgoTransaction;
    let ITrans2: AlgoIndexerTransaction;

    before(async function () {
        MccClient = new MCC.ALGO(algoCreateConfig);
        let tblock = await MccClient.getBlock(21_700_000);
        if (tblock !== null) {
            block1 = tblock;
            const bttrans = block1.transactions[0];
            if (bttrans !== null) {
                BTrans1 = bttrans;
                let titrans = await MccClient.getIndexerTransaction(BTrans1.txid);
                if (titrans !== null) {
                    ITrans1 = titrans;
                }
            }
        }
        let tblock2 = await MccClient.getBlock(21_797_543);
        if (tblock2 !== null) {
            block2 = tblock2;
            const bttrans = block2.transactions[0];
            if (bttrans !== null) {
                BTrans2 = bttrans;
                let titrans = await MccClient.getIndexerTransaction(BTrans2.txid);
                if (titrans !== null) {
                    ITrans2 = titrans;
                }
            }
        }
    });

    it("Should get type ", async function () {
        expect(ITrans1.type).to.eq("axfer");
        expect(ITrans2.type).to.eq("pay");
    });

    it("Should check if native payment ", async function () {
        expect(ITrans1.isNativePayment).to.be.false;
        expect(ITrans2.isNativePayment).to.be.true;
    });

    it("Should get currency name ", async function () {
        expect(ITrans2.currencyName).to.eq("ALGO");
    });

    it("Should get payment summary ", async function () {
        expect((await ITrans1.paymentSummary(MccClient)).isNativePayment).to.be.false;
        expect((await ITrans2.paymentSummary(MccClient)).isNativePayment).to.be.true;
    });
    it("Should get transaction receivingAddresses ", async function () {
        expect(ITrans1.receivingAddresses.length).to.eq(1);
        expect(ITrans2.receivingAddresses.length).to.eq(1);
    });
    it("Should get transaction receivedAmounts", async function () {
        expect(ITrans1.receivedAmounts.length).to.eq(1);
        expect(ITrans2.receivedAmounts.length).to.eq(1);
    });
    it("Should get transaction id ", async function () {
        delete ITrans1.data.transaction.id;
        expect(ITrans1.hash).to.eq("");
    });
    it("Should get transaction roundTime ", async function () {
        delete ITrans1.data.transaction.roundTime;
        expect(ITrans1.unixTimestamp).to.eq(0);
    });
    it("Should get transaction roundTime ", async function () {
        delete ITrans1.data.transaction.note;
        expect(ITrans1.reference).to.eql(['']);
    });
    it("Should get transaction receivedAmounts ", async function () {
        delete ITrans1.data.transaction.assetTransferTransaction;
        expect(ITrans1.receivedAmounts.length).to.eq(0);
    });
    it("Should get transaction currencyName ", async function () {
        expect(ITrans1.currencyName).to.eq("");
    });
    it("Should get transaction receivingAddresses ", async function () {
        expect(ITrans1.receivingAddresses.length).to.eq(0);
    });
});



