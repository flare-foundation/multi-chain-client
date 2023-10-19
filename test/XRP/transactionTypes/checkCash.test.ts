import { expect } from "chai";
import { AddressAmount, BalanceDecreasingSummaryStatus, MCC, XrpTransaction, standardAddressHash, traceManager } from "../../../src";
import { AddressAmountEqual, getTestFile } from "../../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://xrplcluster.com",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe(`CheckCash type (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        traceManager.displayRuntimeTrace = false;
        traceManager.displayStateOnException = false;
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("CheckCash happy path", function () {
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction("67B71B13601CDA5402920691841AC27A156463678E106FABD45357175F9FF406");
        });

        it("should correctly parse sourceAddresses", async function () {
            const addresses = [
                "rw57FJjcRdZ6r3qgwxMNGCD8EJtVkjw1Am", // Transaction sender (pays for fee)
            ];
            expect(transaction.sourceAddresses).to.deep.equal(addresses);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses, "No one receives any xrp").to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected = [{ address: "rw57FJjcRdZ6r3qgwxMNGCD8EJtVkjw1Am", amount: BigInt("12") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected), "Only the fee is payed in xrp").to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected), "No one receives any xrp").to.be.true;
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(standardAddressHash("rw57FJjcRdZ6r3qgwxMNGCD8EJtVkjw1Am"));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("12");
        });

        // // Token transfers
        // it.skip("should correctly parse assetSourceAddresses", async function () {
        //    return;
        // });

        // it.skip("should correctly parse assetReceivingAddresses", async function () {
        //    return;
        // });

        // it.skip("should correctly parse assetSpentAmounts", async function () {
        //    return;
        // });

        // it.skip("should correctly parse assetReceivedAmounts", async function () {
        //    return;
        // });
    });
});
