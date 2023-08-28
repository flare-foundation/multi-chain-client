import { assert, expect } from "chai";
import {
    AddressAmount,
    BalanceDecreasingSummaryStatus,
    MCC,
    PaymentSummaryStatus,
    TransactionSuccessStatus,
    XrpTransaction,
    standardAddressHash,
    toBN,
    traceManager,
} from "../../src";
import { AddressAmountEqual } from "../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("Failed transactions", function () {
    traceManager.displayRuntimeTrace = false;
    traceManager.displayStateOnException = false;
    const MccClient = new MCC.XRP(XRPMccConnection);

    describe("Transaction payment: receiver's fault", async function () {
        let transaction: XrpTransaction;
        const tx_id = "1EB2504C2632414C110D74EE2A1E9357CE2845672D2FEB5BC79160AB25067A8D";

        before(async function () {
            transaction = await MccClient.getTransaction(tx_id);
        });

        it("Should get txId", function () {
            expect(transaction.txid).to.eq(tx_id);
        });

        it("Should get status", function () {
            expect(transaction.successStatus, "status").to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
        });

        it("Should get intendedSpentAmounts", function () {
            const expected: AddressAmount[] = [{ address: "rKbb74HAdKBWPyJC6Q7p8m2BMrBgRs5uWT", amount: toBN("142") }];
            assert(AddressAmountEqual(transaction.intendedSpentAmounts, expected));
        });

        it("Should get intendedReceivedAmounts", function () {
            const expected: AddressAmount[] = [{ address: "rfLyN2k3KShu6kEuXgzQsmiK4xRLsaU8Ad", amount: toBN("42") }];
            assert(AddressAmountEqual(transaction.intendedReceivedAmounts, expected));
        });

        it("Should get payment summary", async function () {
            const summary = await transaction.paymentSummary({
                inUtxo: 0,
                outUtxo: 0,
            });
            expect(summary.status, "status").to.eq(PaymentSummaryStatus.Success);

            assert(summary.response);
        });

        it("Should get balance decreasing summary", async function () {
            const indicator = standardAddressHash("rKbb74HAdKBWPyJC6Q7p8m2BMrBgRs5uWT");
            const summary = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: indicator });
            expect(summary.status, "status").to.eq(BalanceDecreasingSummaryStatus.Success);

            assert(summary.response);
            expect(summary.response.transactionStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
        });
    });

    describe("Transaction not payment: sender's fault", async function () {
        let transaction: XrpTransaction;

        const tx_id = "585D3AAEF6ABF72B6E43F54FDCFA3F6AFA463BA3C28B0D787F0C10AAD2178A5B";

        before(async function () {
            transaction = await MccClient.getTransaction(tx_id);
        });

        it("Should get txId", function () {
            expect(transaction.txid).to.eq(tx_id);
        });

        it("Should get status", function () {
            expect(transaction.successStatus, "status").to.eq(TransactionSuccessStatus.SENDER_FAILURE);
        });

        it("Should not get intendedSpentAmounts", function () {
            expect(() => {
                transaction.intendedSpentAmounts;
            }).to.throw("Intended spend amounts for transaction type OfferCreate are not implemented");
        });

        it("Should not get intendedReceivedAmounts", function () {
            expect(() => {
                transaction.intendedReceivedAmounts;
            }).to.throw("Intended received amounts for transaction type OfferCreate are not implemented");
        });

        it("Should get payment summary", async function () {
            const summary = await transaction.paymentSummary({
                inUtxo: 0,
                outUtxo: 0,
            });
            expect(summary.status, "status").to.eq(PaymentSummaryStatus.NotNativePayment);
        });

        it("Should get balance decreasing summary", async function () {
            const indicator = standardAddressHash("rQp6dDmvv53z9NjCzi2HYMg1jMXSwAsBJ6");
            const summary = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: indicator });
            expect(summary.status, "status").to.eq(BalanceDecreasingSummaryStatus.Success);

            assert(summary.response);
            expect(summary.response.transactionStatus).to.eq(TransactionSuccessStatus.SENDER_FAILURE);
        });
    });

    // TODO: explore how this should be handled
});
