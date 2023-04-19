import { expect } from "chai";
import { AddressAmount, MCC, XrpTransaction, toBN, traceManager } from "../../../src";
import { AddressAmountEqual } from "../../testUtils";
import { start } from "repl";

const XRPMccConnection = {
   url: process.env.XRP_URL || "https://xrplcluster.com",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("search", function () {
   const MccClient = new MCC.XRP(XRPMccConnection);

   let beginning = 77149400;

   const searchedTypes = ["CheckCash", "EscrowCancel", "EscrowCreate", "EscrowFinish", "NFTokenAcceptOffer", "AccountDelete"];
   console.time("start");
   before(async function () {
      for (let j = beginning; j > 0; j--) {
         if (j % 100 == 0) {
            console.log(j);
            console.timeLog(`start`);
         }
         const block = await MccClient.getBlock(j);
         for (let tx of block.data.result.ledger.transactions!) {
            if (typeof tx == "string") continue;
            if (tx.TransactionType in searchedTypes) {
               {
                  console.log(`Transaction of type ${typeof tx} found in block ${j}`);
               }
            }
         }
      }
   });

   it("something", function () {});
});
