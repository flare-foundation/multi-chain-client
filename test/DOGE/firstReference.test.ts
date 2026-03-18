import { expect } from "chai";
import { DogeTransaction } from "../../src/base-objects/transactions/DogeTransaction";
import { MCC, UtxoMccCreate } from "../../src/index";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

interface TxFixture {
    txid: string;
    expectedFirstReference: string | undefined;
}

const TX_FIXTURES: TxFixture[] = [
    // Add entries here, e.g.:
    { txid: "2d7ca360f4b48c9b9a41b6ea517916468b6733cdcd4a6cb9c35a69096b6b517e", expectedFirstReference: "6a444f55543a43423043454244333039354434313843304142393142373345353232434239323046304636354543324634353534303846463235363630374644453137443346" },
    { txid: "4c69f8a63c316410ea6d88d70a38b25362b2208dc5f8941c422f97ccedbc0883", expectedFirstReference: "6a06313934343737" },
    { txid: "e6c2841581987fa4553e8524d79a4d9a630de0223f2622c86aa131a50c23330f", expectedFirstReference: undefined },
    { txid: "0bacd484e3e5e2b1eca68ab99e84ac24dd92c93d3884d81b7decd96d33086589", expectedFirstReference: "6a149468de512e82f6a86b86ccfe0c51ba2755275277" },
    { txid: "a1a8ffeaa60b9b45d8dad8d3a635ce564ad4b0f86b8b56174d5983f7956d555d", expectedFirstReference: "6a204642505266410002000000000000000000000000000000000000000000446d18" },
    { txid: "9e50b4facad6d23aa6285ed875a198de7d8b7eaa544e97f7ec7ea8261dc3ffb0", expectedFirstReference: "6a5e0a00010080f09596aa0302" },
    { txid: "f6c26a8fff36528a91fc938167448d2eb4e53dc76bd9fe7bcf23f9ea046ee269", expectedFirstReference: "6a2046425052664100010000000000000000000000000000000000000000004277ac" },
];

describe(`firstReference fixture tests (${getTestFile(__filename)})`, () => {
    for (const { txid, expectedFirstReference } of TX_FIXTURES) {
        describe(`firstReference for txid ${txid}`, () => {
            let transaction: DogeTransaction;

            before(async () => {
                const client = new MCC.DOGE(DogeMccConnection);
                transaction = await client.getTransaction(txid);
            });

            it("should return expected firstReference", () => {
                expect(transaction.firstReference).to.eq(expectedFirstReference);
            });
        });
    }
});

// describe("Find references", () => {
//     it("should find references in the transaction", async () => {
//         const client = new MCC.DOGE(DogeMccConnection);
//         for (let i = 5598589; i < 5598589 + 10000; i++) {
//             const block = await client.getFullBlock(i);
//             for (const txi of block.transactionIds) {
//                 const tx = await client.getTransaction(txi);
//                 // console.dir(tx);
//                 if (tx.reference.length > 0) {
//                     console.log("Txid:", tx.stdTxid);
//                     console.log(tx.reference);
//                 }
//             }
//         }
//     });
// });
