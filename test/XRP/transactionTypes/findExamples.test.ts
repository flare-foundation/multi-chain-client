// import { expect } from "chai";
// import { AddressAmount, MCC, XrpTransaction, toBN, traceManager } from "../../../src";
// import sinon from "sinon";
// import fs from "fs";
// import { Console } from "console";

// const XRPMccConnection = {
//    url: process.env.XRP_URL || "https://xrplcluster.com",
//    username: process.env.XRP_USERNAME || "",
//    password: process.env.XRP_PASSWORD || "",
//    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
// };

// describe.skip("search", function () {
//    let beginning = 78637600;
//    const output = fs.createWriteStream(`./test/XRP/transactionTypes/log/example${beginning}.log`);

//    const logger = new Console(output);

//    const MccClient = new MCC.XRP(XRPMccConnection);

//    const searchedTypes = ["CheckCash", "EscrowCancel", "EscrowCreate", "EscrowFinish"];
//    console.time("start");
//    logger.log("beginning", beginning);
//    before(async function () {
//       sinon.stub(console, "error");
//       for (let j = beginning; j > 0; j--) {
//          if (j % 100 == 0) {
//             console.log(j);
//             console.timeLog(`start`);
//             if (j % 1000 == 0) {
//                logger.log(j);
//             }
//          }
//          const block = await MccClient.getFullBlock(j);

//          if (!block) {
//             continue;
//          }
//          for (let tx of block.data.result.ledger.transactions!) {
//             if (typeof tx == "string") {
//                continue;
//             }
//             if (searchedTypes.includes(tx.TransactionType as string)) {
//                logger.log(`Transaction of type ${tx.TransactionType} found in block ${j}`);
//             }
//          }
//       }
//    });

//    after(function () {
//       sinon.restore();
//    });

//    it("something", function () {});
// });
