import { expect } from "chai";
import { XrpTransaction } from "../../src/base-objects/transactions/XrpTransaction";
import { MCC } from "../../src/index";
import { getTestFile } from "../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
};

interface TxFixture {
    txid: string;
    expectedDestinationTag: number | undefined;
}

const TX_FIXTURES: TxFixture[] = [
    // Add entries here, e.g.:
    { txid: "A20E08B320872AD1D7D108EC29EBCE1A021FB8E3D9A5152E24AC0FFD3B836C30", expectedDestinationTag: 89060240 },
    { txid: "3DA3F56A9FA75552DD6C26A590183817BB1C0E659DEFB650542E07819B70F9A1", expectedDestinationTag: 289317105 },
    { txid: "24350AC3A8AE84AAD7BF161A94B273FD7D38747B555442C0B64E8FB0C2F6F430", expectedDestinationTag: 0 },
    { txid: "19C010BA18361BF1C696BB1E9CBB7654DD0FC0C19B5DFC9BF66C21D4C5D9912A", expectedDestinationTag: undefined },
];

describe(`destinationTag fixture tests (${getTestFile(__filename)})`, () => {
    for (const { txid, expectedDestinationTag } of TX_FIXTURES) {
        describe(`destinationTag for txid ${txid}`, () => {
            let transaction: XrpTransaction;

            before(async () => {
                const client = new MCC.XRP(XRPMccConnection);
                transaction = await client.getTransaction(txid);
            });

            it("should return expected destinationTag", () => {
                expect(transaction.destinationTag).to.eq(expectedDestinationTag);
            });
        });
    }
});
