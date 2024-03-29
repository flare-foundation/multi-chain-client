import { expect } from "chai";
import { BalanceDecreasingSummaryStatus, MCC, XrpTransaction, standardAddressHash, traceManager } from "../../../src";
import { AddressAmountEqual, getTestFile } from "../../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://xrplcluster.com",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe(`Account delete type (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        traceManager.displayRuntimeTrace = false;
        traceManager.displayStateOnException = false;
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("Account delete happy path", function () {
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction("1AF19BF9717DA0B05A3BFC5007873E7743BA54C0311CCCCC60776AAEAC5C4635");
            //  console.dir(transaction.data, { depth: null });
        });

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal(["rf2c74F1Z2BrvL1dV7WMHYo6Jyaw446Fre"]);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected = [{ address: "rf2c74F1Z2BrvL1dV7WMHYo6Jyaw446Fre", amount: BigInt("2000000") + BigInt("12665795") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: BigInt("12665795") }];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(standardAddressHash("rf2c74F1Z2BrvL1dV7WMHYo6Jyaw446Fre"));
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount).to.eq(BigInt("2000000") + BigInt("12665795"));
        });
    });
});
