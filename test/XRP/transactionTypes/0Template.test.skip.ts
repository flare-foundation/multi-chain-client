import { expect } from "chai";
import { MCC, XrpTransaction, toBN, traceManager } from "../../../src";
import { AddressAmountEqual } from "../../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe.skip("<Type name> type", function () {
    let MccClient: MCC.XRP;

    before(async function () {
        traceManager.displayRuntimeTrace = false;
        traceManager.displayStateOnException = false;
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("<Type name> happy path", function () {
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction("1AF19BF9717DA0B05A3BFC5007873E7743BA54C0311CCCCC60776AAEAC5C4635");
        });

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal(["<address>"]);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal(["<address>"]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected = [{ address: "<address>", amount: toBN("1") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            const expected = [{ address: "<address>", amount: toBN("1") }];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("<Type name> odd case 1", function () {
        it("odd case template 1", async function () {
            // TODO: Add test case
        });
    });
});
