import { expect } from "chai";
import { MCC, XrpTransaction, toBN, traceManager } from "../../src";
import { AddressAmountEqual } from "../testUtils";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("XRP Transaction Types", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   describe("Account Set Transaction", function () {
      let transaction: XrpTransaction;
      before(async function () {
         transaction = await MccClient.getTransaction("327FD263132A4D08170E1B01FE1BB2E21D0126CE58165C97A9173CA9551BCD70");
      });

      it("should correctly parse sourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
      });

      it("should correctly parse receivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal([]);
      });

      it("should correctly parse spentAmounts", async function () {
         expect(transaction.spentAmounts).to.deep.equal([{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: toBN("10") }]);
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

   describe("Payment Transaction Token", function () {
      let transaction: XrpTransaction;
      before(async function () {
         transaction = await MccClient.getTransaction("7BF105CFE4EFE78ADB63FE4E03A851440551FE189FD4B51CAAD9279C9F534F0E");
      });

      it("should correctly parse sourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
      });

      it("should correctly parse receivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal(["ra5nK24KXen9AHvsdFTKHSANinZseWnPcX"]);
      });

      it("should correctly parse spentAmounts", async function () {
         expect(transaction.spentAmounts).to.deep.equal([{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: toBN("10") }]);
      });

      it("should correctly parse receivedAmounts", async function () {
         expect(transaction.receivedAmounts).to.deep.equal([]);
      });

      // Token transfers
      it.skip("should correctly parse assetSourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
      });

      it.skip("should correctly parse assetReceivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal(["ra5nK24KXen9AHvsdFTKHSANinZseWnPcX"]);
      });

      it.skip("should correctly parse assetSpentAmounts", async function () {
         expect(transaction.assetSpentAmounts).to.deep.equal([{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: toBN("1") }]);
      });

      it.skip("should correctly parse assetReceivedAmounts", async function () {
         expect(transaction.assetReceivedAmounts).to.deep.equal([{ address: "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX", amount: toBN("1") }]);
      });
   });

   describe("Payment Transaction Native", function () {
      let transaction: XrpTransaction;
      before(async function () {
         transaction = await MccClient.getTransaction("160426BB861B2E1AD7A4214EE12B41A3C9C4EEBCC15B4D8A5C41E9405E288CDB");
      });

      it("should correctly parse sourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal(["rpAepkGqJnQSNTxozKSu9KPrxHVgyLpL8p"]);
      });

      it("should correctly parse receivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
      });

      it("should correctly parse spentAmounts", async function () {
         const expected = [{ address: "rpAepkGqJnQSNTxozKSu9KPrxHVgyLpL8p", amount: toBN("39") }];
         expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
      });

      it("should correctly parse receivedAmounts", async function () {
         expect(transaction.receivedAmounts).to.deep.equal([{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: toBN("27") }]);
      });

      // Token transfers
      it.skip("should correctly parse assetSourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal([]);
      });

      it.skip("should correctly parse assetReceivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal([]);
      });

      it.skip("should correctly parse assetSpentAmounts", async function () {
         expect(transaction.assetSpentAmounts).to.deep.equal([]);
      });

      it.skip("should correctly parse assetReceivedAmounts", async function () {
         expect(transaction.assetReceivedAmounts).to.deep.equal([]);
      });
   });
});
