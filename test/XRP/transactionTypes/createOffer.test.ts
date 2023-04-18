import { expect } from "chai";
import { AddressAmount, MCC, XrpTransaction, toBN, traceManager } from "../../../src";
import { AddressAmountEqual } from "../../testUtils";

const XRPMccConnection = {
   url: process.env.XRP_URL || "https://xrplcluster.com",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

// Find offerCreate where offer is actually accepted.

describe("createOffer type", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   describe("Offer not accepted at the time", function () {
      let transaction: XrpTransaction;
      before(async function () {
         transaction = await MccClient.getTransaction("0CD69FD1F0A890CC57CDA430213FD294F7D65FF4A0F379A0D09D07A222D324E6");
      });
      const sourceAddress = "rJkg989h7fPaJLm9CEyAsdvwgZYtKs2zzz";

      it("should correctly parse sourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal([sourceAddress]);
      });

      it("should correctly parse receivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal([]);
      });

      it("should correctly parse spentAmounts", async function () {
         const expected = [{ address: sourceAddress, amount: toBN("12") }];
         expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
      });

      it("should correctly parse receivedAmounts", async function () {
         const expected: AddressAmount[] = [];
         expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
      });

      // Token transfers
      it.skip("should correctly parse assetSourceAddresses", async function () {
         expect(transaction.assetSourceAddresses).to.deep.equal([]);
      });

      it.skip("should correctly parse assetReceivingAddresses", async function () {
         expect(transaction.assetReceivingAddresses).to.deep.equal([]);
      });

      it.skip("should correctly parse assetSpentAmounts", async function () {
         expect(transaction.assetSpentAmounts).to.deep.equal([]);
      });

      it.skip("should correctly parse assetReceivedAmounts", async function () {
         expect(transaction.assetReceivedAmounts).to.deep.equal([]);
      });
   });
});
