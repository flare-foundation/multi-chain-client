import { expect } from "chai";
import { AddressAmount, MCC, TransactionSuccessStatus, XrpNodeStatus, XrpTransaction, toBN } from "../../src";
import { AddressAmountEqual } from "../testUtils";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
   rateLimitOptions: {
      timeoutMs: 15000,
   },
};

describe("Xrp bottom block ", function () {
   let MccClient: MCC.XRP;
   let transaction: XrpTransaction;

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
      transaction = await MccClient.getTransaction("B918C0796F0C31CD0B201A775C47FDFC479C1CAF48AC152BA9264062034BFBD5");
   });

   it("Should get intended spend amounts", async function () {
      const intendedSpendAmounts = transaction.intendedSpendAmounts;
      const expected = [
         {
            address: "rJF9FcJbVuq79FSjqHuM9rBSxXSQFtRLu2",
            amount: toBN(85),
         },
      ];
      expect(AddressAmountEqual(intendedSpendAmounts, expected)).to.be.true;
   });

   it("Should get actual spend amounts", async function () {
      const spendAmount = transaction.spentAmounts;
      const expected = [
         {
            address: "rJF9FcJbVuq79FSjqHuM9rBSxXSQFtRLu2",
            amount: toBN(10),
         },
      ];
      expect(AddressAmountEqual(spendAmount, expected)).to.be.true;
   });

   it("Should get intended received amounts", async function () {
      const intendedSpendAmounts = transaction.intendedReceivedAmounts;
      const expected = [
         {
            address: "rLCq1KvoCYeMj4H8hsRFrfPYHCRLLYDHdU",
            amount: toBN(75),
         },
      ];
      expect(AddressAmountEqual(intendedSpendAmounts, expected)).to.be.true;
   });

   it("Should get actual received amounts", async function () {
      const receivedAmount = transaction.receivedAmounts;
      const expected: AddressAmount[] = [];
      expect(AddressAmountEqual(receivedAmount, expected)).to.be.true;
   });

   it("Should be failed transaction due to receiver", async function () {
      expect(transaction.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
   });
});
