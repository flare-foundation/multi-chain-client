import { AlgoBlock, AlgoTransaction, MCC, ZERO_BYTES_32 } from "../../src";
import { AlgoIndexerTransaction } from "../../src/base-objects/transactions/AlgoIndexerTransaction";
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
    it("Should get transaction spentAmounts", async function () {
        expect(ITrans1.spentAmounts[0].amount.toNumber()).to.eq(1000);
        expect(ITrans2.spentAmounts[0].amount.toNumber()).to.eq(1000);
    });
    it("Should get transaction id ", async function () {
        delete ITrans1.data.transaction.id;
        expect(ITrans1.hash).to.eq("");
    });
    it("Should get transaction roundTime ", async function () {
        delete ITrans1.data.transaction.roundTime;
        expect(ITrans1.unixTimestamp).to.eq(0);
    });
    it("Should get transaction note ", async function () {
        delete ITrans1.data.transaction.note;
        expect(ITrans1.reference).to.eql([]);
    });
    it("Should get standard payment reference ", async function () {
        expect(ITrans1.stdPaymentReference).to.eq(ZERO_BYTES_32);
    });
    it("Should get transaction receivedAmounts ", async function () {
        delete ITrans1.data.transaction.assetTransferTransaction;
        expect(ITrans1.receivedAmounts.length).to.eq(0);
    });
    it("Should get transaction spentAmounts ", async function () {
        expect(ITrans1.spentAmounts[0].amount.toNumber()).to.eq(ITrans1.fee.toNumber());
    });
    it("Should get transaction currencyName ", async function () {
        expect(ITrans1.currencyName).to.eq("");
    });
    it("Should get transaction receivingAddresses ", async function () {
        expect(ITrans1.receivingAddresses.length).to.eq(0);
    });
    it("Should list transactions ", async function () {
        let res = await MccClient.listTransactions();
        expect(res).to.not.be.null;
    });
    it("Should list transactions with options ", async function () {
        let res = await MccClient.listTransactions({ sigType: "sig" });
        expect(res).to.not.be.null;
    });
    it("Should get transaction ", async function () {
        let res = await MccClient.getIndexerTransaction("0xULHDCNM665O7M4E44PGEJ7XB3Z7YIF7QYUWY5ZBTPO434M47SZ3Q");
        expect(res).to.not.be.null;
    });
    it("Should not get transaction ", async function () {
        await expect(MccClient.getIndexerTransaction("0xUL")).to.be.rejectedWith("InvalidBlock");
    });
    it("Should get standard payment reference 2", async function () {
        let ti = await MccClient.getIndexerTransaction("2DWIMCX2EUXG2A5PJ55DRNENT5HRHMW7CHBAMY5IWXAA7QWPDHLA");
        expect(ti.stdPaymentReference).to.eq("0x44d5b4718d6bb8daa193c0f3ad272604dd0352ae0e6273aa93d6b2622395313b")
    });
});



