import { expect, assert } from "chai";
import { MCC, XrpTransaction, toBN, traceManager } from "../../../src";
import { AddressAmountEqual } from "../../testUtils";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("Payment transaction type", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
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

   describe("Payment Founding address example", function () {
      let transaction: XrpTransaction;
      before(async function () {
         transaction = await MccClient.getTransaction("0E8C600BB375A62708E662F6B7D1F096CA364793F655A8DBB358F8D723A59AB7");
      });

      it("should correctly parse sourceAddresses", async function () {
         expect(transaction.sourceAddresses).to.deep.equal(["rDM9x1ehphbwXX8UhvF2j8tyuJY2VVnm5"]);
      });

      it("should correctly parse receivingAddresses", async function () {
         expect(transaction.receivingAddresses).to.deep.equal(["r14f8Luu4dYKzNEwFYV2KfA74YZcWVS5F"]);
      });

      it("should correctly parse spentAmounts", async function () {
         const expected = [{ address: "rDM9x1ehphbwXX8UhvF2j8tyuJY2VVnm5", amount: toBN("1400_000010") }];
         console.dir(transaction.spentAmounts, { depth: null });
         console.dir(expected, { depth: null });
         expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
      });

      it("should correctly parse receivedAmounts", async function () {
         const expected = [{ address: "r14f8Luu4dYKzNEwFYV2KfA74YZcWVS5F", amount: toBN("1400_000000") }];
         expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.deep.equal([]);
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

   // TODO: GreProd
   describe.skip("Payment failed", function () {
      let transaction: XrpTransaction;
      const txId = "ABCB6A1F027446C2A0711055978455FE272D69D945A3244D2DC76D16346F60BF";
      before(async function () {
         transaction = await MccClient.getTransaction(txId);
      });

      it("Should get type", function () {
         const type = transaction.type;
         expect(type).to.eq("Payment");
      });

      it("Should get successStatus", function () {
         const status = transaction.successStatus;
         expect(status).to.be.true;
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

      it.skip("Should get assetSpentAmounts", function () {
         const assetSpentAmount = transaction.assetSpentAmounts[0];
         assert(!assetSpentAmount, "No assets were transferred");
      });

      it.skip("Should get assetSourceAddresses", function () {
         const assetSourceAddress = transaction.assetSourceAddresses[0];
         assert(!assetSourceAddress, "No assets were transferred");
      });

      it.skip("Should get assetReceivingAddress", function () {
         const assetReceivingAddress = transaction.assetReceivingAddresses[0];
         assert(!assetReceivingAddress, "No assets were transferred");
      });

      it.skip("Should get assetReceivingAddress", function () {
         const assetReceivedAmount = transaction.assetSpentAmounts[0];
         assert(!assetReceivedAmount, "No assets were transferred");
      });

      it.skip("Should get paymentSummary", async function () {
         //  const paymentSummary = await transaction.paymentSummary();
      });
   });
});
