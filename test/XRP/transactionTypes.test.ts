import { expect, assert } from "chai";
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
         const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: toBN("10") }];
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
         const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: toBN("10") }];
         expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
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

   describe("Account Delete Transaction", function () {
      // TODO: Find example where account delete transfers both native XRP and an issued token (Asset)
      let transaction: XrpTransaction;
      before(async function () {
         transaction = await MccClient.getTransaction("1AF19BF9717DA0B05A3BFC5007873E7743BA54C0311CCCCC60776AAEAC5C4635");
      });

      it("should correctly parse sourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal(["rf2c74F1Z2BrvL1dV7WMHYo6Jyaw446Fre"]);
      });

      it("should correctly parse receivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
      });

      it("should correctly parse spentAmounts", async function () {
         const expected = [{ address: "rf2c74F1Z2BrvL1dV7WMHYo6Jyaw446Fre", amount: toBN("2000000").add(toBN("12665795")) }];
         expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
      });

      it("should correctly parse receivedAmounts", async function () {
         const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: toBN("12665795") }];
         expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
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

   describe("Payment failed", function () {
      let transaction: XrpTransaction;
      let txId = "ABCB6A1F027446C2A0711055978455FE272D69D945A3244D2DC76D16346F60BF";
      before(async function () {
         transaction = await MccClient.getTransaction(txId);
      });

      it("Should get type", function () {
         const type = transaction.type;
         expect(type).to.eq("");
      });
      it("Should get successStatus", function () {
         const status = transaction.successStatus;
         expect(status).to.eq("Payment");
      });

      it("Should get reference", function () {
         const reference = transaction.reference;
         expect(reference).to.eq("");
      });

      it("Should get currencyName", function () {
         const currencyName = transaction.currencyName;
         expect(currencyName).to.eq("");
      });

      it("Should get fee", function () {
         const fee = transaction.fee;
         expect(fee).to.eq(toBN(12));
      });
      it("Should get sourceAddress", function () {
         const sourceAddress = transaction.sourceAddresses[0];
         expect(sourceAddress).to.eq("r9ZrUqa98hycMA4QCuz2twW5x7JhiHYhxB");
      });
      it("Should get spentAmounts", function () {
         const spentAmount = transaction.spentAmounts[0];
         expect(spentAmount.amount).to.eq(toBN(12));
         expect(spentAmount.address).to.eq("r9ZrUqa98hycMA4QCuz2twW5x7JhiHYhxB");
      });

      it("Should get receivingAddress", function () {
         const receivingAddress = transaction.receivingAddresses[0];
         assert(!receivingAddress, "No xrp was transferred");
      });
      it("Should get receivedAmounts", function () {
         const receivedAmounts = transaction.receivedAmounts[0];
         assert(!receivedAmounts, "No xrp was transferred");
      });

      it("Should get assetSpentAmounts", function () {
         const assetSpentAmount = transaction.assetSpentAmounts[0];
         assert(!assetSpentAmount, "No assets were transferred");
      });
      it("Should get assetSourceAddresses", function () {
         const assetSourceAddress = transaction.assetSourceAddresses[0];
         assert(!assetSourceAddress, "No assets were transferred");
      });

      it("Should get assetReceivingAddress", function () {
         const assetReceivingAddress = transaction.assetReceivingAddresses[0];
         assert(!assetReceivingAddress, "No assets were transferred");
      });

      it("Should get assetReceivingAddress", function () {
         const assetReceivedAmount = transaction.assetSpentAmounts[0];
         assert(!assetReceivedAmount, "No assets were transferred");
      });

      it("Should get paymentSummary", async function () {
         const paymentSummary = await transaction.paymentSummary();
      });
   });

   describe.skip("Template", function () {
      let transaction: XrpTransaction;
      let txId = "";
      before(async function () {
         transaction = await MccClient.getTransaction(txId);
      });

      it("Should get type", function () {
         const type = transaction.type;
         expect(type).to.eq("");
      });
      it("Should get successStatus", function () {
         const status = transaction.successStatus;
         expect(status).to.eq("");
      });

      it("Should get reference", function () {
         const reference = transaction.reference;
         expect(reference).to.eq("");
      });

      it("Should get currencyName", function () {
         const currencyName = transaction.currencyName;
         expect(currencyName).to.eq("");
      });

      it("Should get fee", function () {
         const fee = transaction.fee;
         expect(fee).to.eq(toBN(12));
      });
      it("Should get sourceAddress", function () {
         const sourceAddress = transaction.sourceAddresses[0];
         expect(sourceAddress).to.eq("");
      });
      it("Should get spentAmounts", function () {
         const spentAmount = transaction.spentAmounts[0];
         expect(spentAmount.amount).to.eq(toBN(0));
         expect(spentAmount.address).to.eq("");
      });

      it("Should get receivingAddress", function () {
         const receivingAddress = transaction.receivingAddresses[0];
         expect(receivingAddress).to.eq("");
      });
      it("Should get receivedAmounts", function () {
         const receivedAmounts = transaction.receivedAmounts[0];
         expect(receivedAmounts.amount).to.eq(0);
      });

      it("Should get assetSpentAmounts", function () {
         const assetSpentAmount = transaction.assetSpentAmounts;
      });
      it("Should get assetSourceAddresses", function () {
         const assetSpentAmount = transaction.assetSourceAddresses;
      });

      it("Should get assetReceivingAddress", function () {
         const assetReceivingAddress = transaction.assetReceivingAddresses[0];
      });

      it("Should get assetReceivingAddress", function () {
         const assetReceivedAmount = transaction.assetSpentAmounts[0];
      });

      it("Should get paymentSummary", async function () {
         const paymentSummary = await transaction.paymentSummary();
      });
   });
});
