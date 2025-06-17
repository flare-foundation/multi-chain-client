import { expect } from "chai";
import { AddressAmount, BalanceDecreasingSummaryStatus, MCC, XrpTransaction, standardAddressHash } from "../../../src";
import { AddressAmountEqual, getTestFile } from "../../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://xrplcluster.com",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

// Find offerCreate where offer is actually accepted.

describe(`createOffer type (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("Offer not accepted at the time", function () {
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction("0CD69FD1F0A890CC57CDA430213FD294F7D65FF4A0F379A0D09D07A222D324E6");
        });
        const sourceAddress = "rJkg989h7fPaJLm9CEyAsdvwgZYtKs2zzz";

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal([sourceAddress]);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected = [{ address: sourceAddress, amount: BigInt("12") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(standardAddressHash("rJkg989h7fPaJLm9CEyAsdvwgZYtKs2zzz"));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("12");
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
