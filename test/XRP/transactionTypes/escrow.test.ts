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

describe(`Escrow types (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        traceManager.displayRuntimeTrace = false;
        traceManager.displayStateOnException = false;
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("EscrowCreate", function () {
        let transaction: XrpTransaction;

        const txId = "C44F2EB84196B9AD820313DBEBA6316A15C9A2D35787579ED172B87A30131DA7";
        const fee = "10";
        const value = "10000";
        const addressPay = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn";
        const addressRec = "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX";

        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal([addressPay]);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected = [{ address: addressPay, amount: BigInt(fee) + BigInt(value) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(standardAddressHash(addressPay));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount).to.eq(BigInt(fee) + BigInt(value));
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

    describe("EscrowCancel", function () {
        let transaction: XrpTransaction;

        const txId = "B24B9D7843F99AED7FB8A3929151D0CCF656459AE40178B77C9D44CED64E839B";
        const fee = "12";
        const value = "10000";
        const addressPay = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn";
        const addressRec = "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX";

        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal([]);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal([addressPay]);
        });

        it("should correctly parse spentAmounts", function () {
            expect(transaction.spentAmounts.length).to.eq(0);
        });

        it("should correctly parse feeSignerTotalAmount address amount", async function () {
            const expected = { address: addressPay, amount: BigInt(fee) - BigInt(value) };
            expect(singleAddressAmountEqual(transaction.feeSignerTotalAmount, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected = [{ address: addressPay, amount: BigInt(value) - BigInt(fee) }];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(standardAddressHash(addressPay));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount).to.eq(BigInt(fee) - BigInt(value));
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

    describe("EscrowFinish", function () {
        let transaction: XrpTransaction;

        const txId = "317081AF188CDD4DBE55C418F41A90EC3B959CDB3B76105E0CBE6B7A0F56C5F7";
        const fee = "5000";
        const value = "1000000000000000";
        const addressPay = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn";
        const addressRec = "rKDvgGUsNPZxsgmoemfrgXPS2Not4co2op";

        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal([addressPay]);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal([addressRec]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected: AddressAmount[] = [{ address: addressPay, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            const expected = [{ address: addressRec, amount: BigInt(value) }];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary #1", function () {
            const summary = transaction.balanceDecreasingSummary(standardAddressHash(addressPay));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq(BigInt(fee).toString());
        });

        it("should get balanceDecreasingSummary #2", function () {
            const summary = transaction.balanceDecreasingSummary(standardAddressHash(addressRec));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.NoSourceAddress);
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
});
