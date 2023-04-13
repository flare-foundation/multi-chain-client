import { expect } from "chai";
import { MCC, XrpTransaction, toBN, traceManager } from "../../../src";
import { AddressAmountEqual } from "../../testUtils";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("CheckCancel type", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   describe("CheckCancel happy path", function () {
      // TODO: Find example where account delete transfers both native XRP and an issued token (Asset)
      let transaction: XrpTransaction;
      before(async function () {
         transaction = await MccClient.getTransaction("D3328000315C6DCEC1426E4E549288E3672752385D86A40D56856DBD10382953");
      });

      it("should correctly parse sourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal(["r4uZkneFvKrbNVJgtB3tBJooMBryzySnEa"]);
      });

      it("should correctly parse receivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal([]);
      });

      it("should correctly parse spentAmounts", async function () {
         const expected = [{ address: "r4uZkneFvKrbNVJgtB3tBJooMBryzySnEa", amount: toBN("12") }];
         expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
      });

      it("should correctly parse receivedAmounts", async function () {
         expect(transaction.receivedAmounts).to.deep.equal([]);
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
