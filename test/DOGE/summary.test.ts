import { expect, assert } from "chai";
import { BalanceDecreasingSummaryStatus, DogeTransaction, MCC, PaymentSummaryStatus, TransactionSuccessStatus, UtxoMccCreate, ZERO_BYTES_32 } from "../../src";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Transaction summaries, ${getTestFile(__filename)}`, function () {
    const MccClient = new MCC.DOGE(DogeMccConnection);

    describe("full attestation with one vin", function () {
        let tx: DogeTransaction;
        const txId = "2a75d84e2dd7538753b2215b124eb9845f4374944e2dd03d96ed7cdbca0bbf85";
        const getter = (a: string) => MccClient.getTransaction(a);

        before(async function () {
            tx = await MccClient.getTransaction(txId);
            await tx.makeFull(getter);
        });

        it("Should create payment summary", async function () {
            const summary = await tx.paymentSummary({ transactionGetter: getter, inUtxo: 0, outUtxo: 0 });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            assert(summary.response);
            assert(summary.response?.isFull);
            expect(summary.response.spentAmount.toNumber()).to.eq(209645600000);
            expect(summary.response?.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
        });

        it("Should create balance decreasing summary", async function () {
            const summary = await tx.balanceDecreasingSummary({ transactionGetter: getter, sourceAddressIndicator: ZERO_BYTES_32 });
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            assert(summary.response);
            assert(summary.response?.isFull);
            expect(summary.response?.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
            expect(summary.response?.spentAmount.toNumber()).to.eq(209645600000);
        });
    });

    describe("transaction with one vin, without making full", function () {
        let tx: DogeTransaction;
        const txId = "2a75d84e2dd7538753b2215b124eb9845f4374944e2dd03d96ed7cdbca0bbf85";
        const getter = (a: string) => MccClient.getTransaction(a);

        before(async function () {
            tx = await MccClient.getTransaction(txId);
        });

        it("Should create payment summary", async function () {
            const summary = await tx.paymentSummary({ transactionGetter: getter, inUtxo: 0, outUtxo: 0 });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            assert(summary.response);
            assert(summary.response?.isFull);
            expect(summary.response.spentAmount.toNumber()).to.eq(209645600000);
            expect(summary.response?.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
        });

        it("Should create balance decreasing summary", async function () {
            const summary = await tx.balanceDecreasingSummary({ transactionGetter: getter, sourceAddressIndicator: ZERO_BYTES_32 });
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            assert(summary.response);
            assert(summary.response?.isFull);
            expect(summary.response?.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
            expect(summary.response?.spentAmount.toNumber()).to.eq(209645600000);
        });
    });

    describe("partial attestation", function () {
        let tx: DogeTransaction;
        const txId = "04292a205004589cbb8223bee8d0d1580846e1e8fb35c4db19d77f1dda126ddd";
        const getter = (a: string) => MccClient.getTransaction(a);

        before(async function () {
            tx = await MccClient.getTransaction(txId);
        });

        it("should be type payment", function () {
            expect(tx.type).to.eq("partial_payment");
        });

        it("Should create payment summary", async function () {
            const summary = await tx.paymentSummary({ transactionGetter: getter, inUtxo: 0, outUtxo: 0 });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            assert(summary.response);
            assert(!summary.response?.isFull);
            expect(summary.response?.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
        });

        it("Should create balance decreasing summary", async function () {
            const summary = await tx.balanceDecreasingSummary({ transactionGetter: getter, sourceAddressIndicator: ZERO_BYTES_32 });
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            assert(summary.response);
            expect(summary.response?.isFull, "full").to.be.false;
            expect(summary.response?.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
            expect(summary.response?.spentAmount.toNumber()).to.eq(476276000000);
        });
    });
});
