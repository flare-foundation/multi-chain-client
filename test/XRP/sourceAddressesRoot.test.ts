import { expect } from "chai";
import { MCC, XrpTransaction } from "../../src";
import { getTestFile } from "../testUtils";
import { ZERO_BYTES_32 } from "@flarenetwork/js-flare-common";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
};

const SOURCE_ADDRESS_ROOT_FIXTURES = [
    {
        txid: "C94C88F70799DE3DEA6C5ECD65729EBAA5A6DC086D38E4BD40CA236A508BF056",
        expected: "0x2f0cdffefa7f270919a31d1898cb2129eaa255ac75ed22d89155466f93254c1b",
        destinationAddressHash: "0x8f40c24f58fb0abfe1312837a2345d2294762ca46994acc99ff13ccba01fe1b2",   
    },
    {
        txid: "3C2B0D8C1938271D9A95E657DD7B3D38FE77E84338AB63DFFF5A6079D944EFD0",
        expected: "0x97f123575f0fa54abec71fbc3740802261b15252e51f0051b11e39dec51c5602",
        destinationAddressHash: ZERO_BYTES_32,   
    },
    {
        txid: "72F485775B8BE0E5E0F398CB29BAD007EE9E29E450649778FCED98E735BFAE44",
        expected: "0xe9f8d46cc405736e946e2e299ae9106ef494b7454f802028be9fe665398e69e3",
        destinationAddressHash: "0x32ba9ed8519cb562a6f845df24258d3d093fab95c049ebe45a25662c226dfb43",   
    },
    {
        txid: "77D253B755A6354855B3E9A39E75AB136CDA25D5D35EFF064D5DCADE7EAB11C0",
        expected: "0xb49570a6ea2dfd698eb55e351ba2b017f6da1354874a9ac2ab072102d38085d8",
        destinationAddressHash: "0x0d17fa627fd6a24b7da9c6a2227a2e380e65b6180cb357a42e2215fbb0a975cf",   
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

    for (const { txid, destinationAddressHash } of SOURCE_ADDRESS_ROOT_FIXTURES) {
        it(`Should get correct destinationAddressHash for ${txid}`, async function () {
            const transaction: XrpTransaction = await client.getTransaction(txid);
            const paymentSummary = transaction.xrpPaymentSummary();
            if (paymentSummary.response) {
                expect(paymentSummary.response.receivingAddressHash).to.eq(destinationAddressHash);
            }
        });
    }
});
