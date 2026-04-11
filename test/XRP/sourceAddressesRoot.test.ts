import { expect } from "chai";
import { MCC, XrpTransaction } from "../../src";
import { getTestFile } from "../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
};

const SOURCE_ADDRESS_ROOT_FIXTURES = [
    {
        txid: "C94C88F70799DE3DEA6C5ECD65729EBAA5A6DC086D38E4BD40CA236A508BF056",
        expected: "0x2f0cdffefa7f270919a31d1898cb2129eaa255ac75ed22d89155466f93254c1b",
    },
    {
        txid: "3C2B0D8C1938271D9A95E657DD7B3D38FE77E84338AB63DFFF5A6079D944EFD0",
        expected: "0x97f123575f0fa54abec71fbc3740802261b15252e51f0051b11e39dec51c5602",
    },
    {
        txid: "72F485775B8BE0E5E0F398CB29BAD007EE9E29E450649778FCED98E735BFAE44",
        expected: "0xe9f8d46cc405736e946e2e299ae9106ef494b7454f802028be9fe665398e69e3",
    },
];

describe(`XRP sourceAddressesRoot tests (${getTestFile(__filename)})`, function () {
    let client: MCC.XRP;

    before(async function () {
        client = new MCC.XRP(XRPMccConnection);
    });

    for (const { txid, expected } of SOURCE_ADDRESS_ROOT_FIXTURES) {
        it(`Should get correct sourceAddressesRoot for ${txid}`, async function () {
            const transaction: XrpTransaction = await client.getTransaction(txid);
            expect(transaction.sourceAddressesRoot).to.eq(expected);
        });
    }
});
