import { expect } from "chai";
import { AddressAmount, MCC, XrpTransaction, toBN, traceManager } from "../../../src";
import { AddressAmountEqual } from "../../testUtils";

const XRPMccConnection = {
   url: process.env.XRP_URL || "https://xrplcluster.com",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("CheckCash type", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   describe("CheckCash happy path", function () {
      let transaction: XrpTransaction;
      before(async function () {
         transaction = await MccClient.getTransaction("67B71B13601CDA5402920691841AC27A156463678E106FABD45357175F9FF406");
      });

      it("should correctly parse sourceAddresses", async function () {
         const addresses = [
            "rw57FJjcRdZ6r3qgwxMNGCD8EJtVkjw1Am", // Transaction sender (pays for fee
         ];
         expect(transaction.sourceAddresses).to.deep.equal(addresses);
      });

      it("should correctly parse receivingAddresses", async function () {
         expect(transaction.receivingAddresses, "No one receives any xrp").to.deep.equal([]);
      });

      it("should correctly parse spentAmounts", async function () {
         const expected = [{ address: "rw57FJjcRdZ6r3qgwxMNGCD8EJtVkjw1Am", amount: toBN("12") }];
         expect(AddressAmountEqual(transaction.spentAmounts, expected), "Only the fee is payed in xrp").to.be.true;
      });

      it("should correctly parse receivedAmounts", async function () {
         const expected: AddressAmount[] = [];
         expect(AddressAmountEqual(transaction.receivedAmounts, expected), "No one receives any xrp").to.be.true;
      });

      // Token transfers
      it.skip("should correctly parse assetSourceAddresses", async function () {
         return;
      });

      it.skip("should correctly parse assetReceivingAddresses", async function () {
         return;
      });

      it.skip("should correctly parse assetSpentAmounts", async function () {
         return;
      });

      it.skip("should correctly parse assetReceivedAmounts", async function () {
         return;
      });
   });
});
