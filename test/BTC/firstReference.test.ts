import { expect } from "chai";
import { BtcTransaction } from "../../src/base-objects/transactions/BtcTransaction";
import { MCC, UtxoMccCreate } from "../../src/index";
import { getTestFile } from "../testUtils";

const BtcMccConnection = {
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
} as UtxoMccCreate;

interface TxFixture {
    txid: string;
    expectedFirstReference: string | undefined;
}

const TX_FIXTURES: TxFixture[] = [
    {
        txid: "22306ddb5f7939312c4685691f182c26f3cd77934e2eb74a8a00abb30fba26df",
        expectedFirstReference: "6a24aa21a9edd8535c80b916636d9898204b517316dd4f097b7e2af8ee21c1129dfff25afaf8",
    },
    {
        // TODO: this is most likely a mistake
        txid: "4d3df0412fe024c1908bda287ba195fac3551820fef499b20bfa68ac4466befc",
        expectedFirstReference: "6a5d0c00c0a2330397ba9787880201",
    },
    { txid: "bdf3e4ee1f8a7635ed5c86fb73093601590a51fd066952222e4260cbb4277a64", expectedFirstReference: undefined },
    {
        txid: "ba6be286b8e65e01dd3ac73c159e6e3e4e1d8c666d76dddead341e27062bebe2",
        expectedFirstReference:
            "6a4066726f6d3a302e303538383132424e4228425343293a307836354341393131443046433464614231363443324636434137374430384445634364396333344561",
    },
];

describe(`firstReference fixture tests (${getTestFile(__filename)})`, () => {
    for (const { txid, expectedFirstReference } of TX_FIXTURES) {
        describe(`firstReference for txid ${txid}`, () => {
            let transaction: BtcTransaction;

            before(async () => {
                const client = new MCC.BTC(BtcMccConnection);
                transaction = await client.getTransaction(txid);
            });

            it("should return expected firstReference", () => {
                expect(transaction.firstReference).to.eq(expectedFirstReference);
            });
        });
    }
});

// describe("Find referecnes", () => {
//     it("should find references in the transaction", async () => {
//         const client = new MCC.BTC(BtcMccConnection);
//         const block = await client.getFullBlock(932262);
//         for (const tx of block.transactions) {
//             if (tx.reference.length > 0) {
//                 console.log("Txid:", tx.stdTxid);
//                 console.log(tx.reference);
//             }
//         }
//     });
// });
