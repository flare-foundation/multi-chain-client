import { expect } from "chai";
import { BtcTransaction, MCC, PaymentNonexistenceSummaryStatus, TransactionSuccessStatus, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";
import exp from "constants";

const BtcMccConnection = {
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
    rateLimitOptions: {
        timeoutMs: 15000,
    },
} as UtxoMccCreate;

describe(`reference summaries, (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.BTC;

    describe(`BTC payment summary`, function () {
        let transaction: BtcTransaction;
        const txid = "ed30230596b7b801391b7b1f9aba414ac925a50a8dce32988ac075ccce746545";

        before(async function () {
            MccClient = new MCC.BTC(BtcMccConnection);
            transaction = await MccClient.getTransaction(txid);
        });

        it("Should be full transaction", async function () {
            expect(transaction.type).to.eq("payment");
        });

        it("Should get summary", async function () {
            const summary = transaction.paymentNonexistenceSummary(0);
            expect(summary.status).to.eq(PaymentNonexistenceSummaryStatus.Success);

            expect(summary.response?.receivedAmount).to.eq(110252n);
            expect(summary.response?.intendedReceivingAmount).to.eq(110252n);
            expect(summary.response?.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
        });

        it("Should get invalid out utxo error", async function () {
            const error = transaction.paymentNonexistenceSummary(-1);
            expect(error).to.deep.eq({
                status: PaymentNonexistenceSummaryStatus.InvalidOutUtxo,
            });
        });
    });

    describe(`BTC nonstandard output payment summary`, function () {
        let transaction: BtcTransaction;
        const txid = "c0b2cf75b47d1e7f48cdb4287109ff1dd5bcf146d5f77a9e8784c0c9c0ef02ad";

        before(async function () {
            MccClient = new MCC.BTC(BtcMccConnection);
            transaction = await MccClient.getTransaction(txid);
        });

        it("Should not construct summary", async function () {
            const summary = transaction.paymentNonexistenceSummary(0);
            expect(summary.status).to.eq(PaymentNonexistenceSummaryStatus.NoReceiveAmountAddress);
        });
    });

    describe(`BTC nonstandard input payment summary`, function () {
        let transaction: BtcTransaction;
        const txid = "435fb30baf0d93712d021158636be1e1bc77c557e5b8e4c687741f8275687001";

        before(async function () {
            MccClient = new MCC.BTC(BtcMccConnection);
            transaction = await MccClient.getTransaction(txid);
        });

        it("Should not construct summary", async function () {
            const summary = transaction.paymentNonexistenceSummary(0);
            expect(summary.status).to.eq(PaymentNonexistenceSummaryStatus.Success);

            expect(summary.response?.receivedAmount).to.eq(479999n);
            expect(summary.response?.receivingAddress).to.eq("1E9TG1fWGTABS82QMG4F8QuUZ2WVLDbEXy");
        });
    });

    describe("BTC summary coinbase ", function () {
        let transaction: BtcTransaction;
        const txid = "896081dd98965cb801dde02cf6981c65ff61b923c35fe9320944fd4546b7b5bd";

        before(async function () {
            transaction = await MccClient.getTransaction(txid);
        });

        it("Should be coinbase transaction", async function () {
            expect(transaction.type).to.eq("coinbase");
        });

        it("Should get invalid in utxo error", async function () {
            const summary = transaction.paymentNonexistenceSummary(0);
            expect(summary).to.deep.eq({
                status: PaymentNonexistenceSummaryStatus.Coinbase,
            });
        });
    });
});
