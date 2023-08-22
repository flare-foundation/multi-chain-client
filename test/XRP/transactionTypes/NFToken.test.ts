import { expect } from "chai";
import { BalanceDecreasingSummaryStatus, MCC, XrpTransaction, standardAddressHash, toBN, traceManager } from "../../../src";
import { AddressAmountEqual, getTestFile } from "../../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://xrplcluster.com",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

// Find Escrow examples with XRP where offer is actually accepted.

describe(`NFTokens types (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        traceManager.displayRuntimeTrace = false;
        traceManager.displayStateOnException = false;
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("NFTokenAcceptOffer", function () {
        let transaction: XrpTransaction;

        const txId = "BEB64444C36D1072820BAED317BE2E6470AFDAD9D8FB2D16A15A4D46E5A71909";
        const fee = "12";
        const value = "1000";
        const minterFee = "58";
        const addressSell = "rDuck4z5jdAJLDaRMwpc2xZhsCKqqTMRsr";
        const addressBuy = "rsa614fckHaBjDpCcZNQqfvVFVPYZzPvE2";
        const minter = "rpAETGuhJW5ZYfg3PdsCTELv4ho147AoE9";

        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses.sort()).to.deep.equal([addressBuy].sort());
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([minter, addressSell]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: addressBuy, amount: toBN(value) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected = [
                { address: minter, amount: toBN(minterFee) },
                { address: addressSell, amount: toBN(value).sub(toBN(fee)).sub(toBN(minterFee)) },
            ];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary #1", async function () {
            const summary = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: standardAddressHash(addressSell) });
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq(toBN(fee).sub(toBN(value)).add(toBN(minterFee)).toString());
        });

        it("should get balanceDecreasingSummary #2", async function () {
            const summary = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: standardAddressHash(addressBuy) });
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq(toBN(value).toString());
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
