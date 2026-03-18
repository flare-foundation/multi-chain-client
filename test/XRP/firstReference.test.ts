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
    expectedFirstReference: string | undefined;
}

const TX_FIXTURES: TxFixture[] = [
    { txid: "18A927ECDF05AFF58F719013DFE2D9AA8C60C55FCCA21DA2590C0365C80635F7", expectedFirstReference: "496E6974696174656420766961202453454E54206D61726B6574206D616B6572" },
    { txid: "A20E08B320872AD1D7D108EC29EBCE1A021FB8E3D9A5152E24AC0FFD3B836C30", expectedFirstReference: undefined },
    { txid: "CC91969767637F2E9555D9CFA014AE4A7949CF9E5FC1C3FB004DDB91E93D0226", expectedFirstReference: undefined },
    { txid: "1A93C206D3006C5BF75C41D69891C1AA2E0E0CE86FA6DC1220D926179DAA958D", expectedFirstReference: "666F786C65742D62657461" },
    { txid: "1337FB26647B62D574D442E7A1FA79878A8B7959B73C0857855DCF40E22C30CC", expectedFirstReference: "46425052664100020000000000000000000000000000000000000000004D5760" },
    { txid: "ED0BC6EE60CAC66F1D918B9363BA2544DC00110419A62072A355FA45F869B5B6", expectedFirstReference: "5468697320746F6B656E2064726F70206973206120726573756C74206F6620796F75722041534320686F6C64696E67732070726F706F7274696F6E61746520746F20746F74616C20737570706C792C2063616C63756C617465642061732070726F6365656473206F6620343525206F6620616E6E75616C2031322C3030302C3030302041534320737570706C7920696E63726561736520646973747269627574656420746F20616C6C2041534320686F6C646572732077686572652044726F70733E46656573206F6E20616E20686F75726C792C206461696C792C207765656B6C792C206F72206D6F6E74686C792062617369732E20466F72206D6F726520696E666F726D6174696F6E2076697369742068747470733A2F2F7777772E617363656E73696F6E696E6465782E636F6D2F" },
    { txid: "C609F5AA2FB21DDA4DDBC36147A9ACC4A8D8937C1B0EA74BFE76FD5B625BC9BA", expectedFirstReference: "3639303835373338" }, // has 2 references
    { txid: "54DBF5A7B2110E403E6A126F169070D4EDB4B7D97A9FF7D1EC0FCB118E2868C0", expectedFirstReference: "37476C4875723345314531354F35376D5A57636752" },
    { txid: "70155389C33F661879F4E95704E06DA01305CC30049826A08407E715BE1D0EB4", expectedFirstReference: "3639303835373438" }, // has 2 references
    // { txid: "undefined", expectedFirstReference: "undefined" },
];

describe(`firstReference fixture tests (${getTestFile(__filename)})`, () => {
    for (const { txid, expectedFirstReference } of TX_FIXTURES) {
        describe(`firstReference for txid ${txid}`, () => {
            let transaction: XrpTransaction;

            before(async () => {
                const client = new MCC.XRP(XRPMccConnection);
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
//         const client = new MCC.XRP(XRPMccConnection);
//         for (let i = 102798029; i < 102798029 + 300; i++) {
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