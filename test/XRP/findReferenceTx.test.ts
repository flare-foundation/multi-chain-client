// import { MCC, XrpBlock, ZERO_BYTES_32 } from "../../src";
// import { getTestFile } from "../testUtils";

// const XRPMccConnection = {
//     url: process.env.XRP_URL || "",
//     username: process.env.XRP_USERNAME || "",
//     password: process.env.XRP_PASSWORD || "",
//     apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
// };

// describe(`Find xrp transction to test (${getTestFile(__filename)})`, function () {
//     let MccClient: MCC.XRP;
//     let block: XrpBlock;
//     const blockNumber = 72_387_695;
//     const blockHash = "2492B09472F24DB37B124A2F9D1D0FA6883EF0FE51494938A54E6CD93295C086";

//     before(async function () {
//         MccClient = new MCC.XRP(XRPMccConnection);
//     });

//     it("Should find txses", async function () {
//         const initial_block = 96780000;
//         for (let i = 0; i < 2000; i++) {
//             console.log(`Searching block ${initial_block + i}`);
//             const block = await MccClient.getFullBlock(initial_block + i);
//             for (const tx of block.transactions) {
//                 if (tx.stdPaymentReference != ZERO_BYTES_32) {
//                     console.log(`TX type: ${tx.type}`);
//                     console.log(`Found tx ${tx.txid} with payment reference ${tx.stdPaymentReference}`);

//                 }
//             }
//         }
//     });
// });
