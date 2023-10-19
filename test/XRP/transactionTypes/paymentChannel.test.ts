import { expect } from "chai";
import { AddressAmount, BalanceDecreasingSummaryStatus, MCC, XrpTransaction, standardAddressHash, traceManager } from "../../../src";
import { AddressAmountEqual, getTestFile, singleAddressAmountEqual } from "../../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://xrplcluster.com",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

// Find Escrow examples with XRP where offer is actually accepted.

describe(`PaymentChannel types (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        traceManager.displayRuntimeTrace = false;
        traceManager.displayStateOnException = false;
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("PaymentChannelCreate", function () {
        let transaction: XrpTransaction;

        const txId = "711C4F606C63076137FAE90ADC36379D7066CF551E96DA6FE2BDAB5ECBFACF2B";
        const fee = BigInt("10");
        const value = BigInt("1000");
        const addressPay = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn";
        const addressRec = "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX";

        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([addressPay]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: addressPay, amount: fee + value }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary", async function () {
            const summary = await transaction.balanceDecreasingSummary(standardAddressHash(addressPay));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount).to.eq(fee + value);
        });

        // // Token transfers
        // it.skip("should correctly parse assetSourceAddresses", async function () {
        //    expect(transaction.assetSourceAddresses).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetReceivingAddresses", async function () {
        //    expect(transaction.assetReceivingAddresses).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetSpentAmounts", async function () {
        //    expect(transaction.assetSpentAmounts).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetReceivedAmounts", async function () {
        //    expect(transaction.assetReceivedAmounts).to.deep.equal([]);
        // });
    });

    describe("PaymentChannelFund", function () {
        let transaction: XrpTransaction;

        const txId = "877FA6E2FF8E08597D1F24E30BE8E52D0C9C06F0D620C5721E55622B6A632DFF";
        const fee = BigInt("12");
        const value = BigInt("1000000");
        const addressPay = "rJnQrhRTXutuSwtrwxYiTkHn4Dtp8sF2LM";

        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([addressPay]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: addressPay, amount: fee + value }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary", async function () {
            const summary = await transaction.balanceDecreasingSummary(standardAddressHash(addressPay));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount).to.eq(fee + value);
        });
    });

    describe("PaymentChannelClaim", function () {
        let transaction: XrpTransaction;

        const txId = "9C0CAAC3DD1A74461132DA4451F9E53BDF4C93DFDBEFCE1B10021EC569013B33";
        const fee = BigInt("5606");
        const value = BigInt("99000000");
        const addressRec = "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH";

        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal([]);
        });

        it("should correctly parse feeSignerTotalAmount address amount", function () {
            const expected = { address: addressRec, amount: fee - value };
            expect(singleAddressAmountEqual(transaction.feeSignerTotalAmount, expected)).to.be.true;
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal([addressRec]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            const expected = [{ address: addressRec, amount: value - fee }];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(standardAddressHash(addressRec));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount).to.eq(fee - value);
        });
    });
});
