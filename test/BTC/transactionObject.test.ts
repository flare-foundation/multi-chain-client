import { expect } from "chai";
import { BtcTransaction, MCC, UtxoMccCreate } from "../../src";

const BtcMccConnection = {
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Transaction Btc test ", function () {
   let MccClient: MCC.BTC;

   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   describe("Transaction full processed ", function () {
      const txid = "0x4d58bd737d87eb2011ba7e0d33d3a0c8f94f13020dd096f8d1b96849c9660a53";
      let transaction: BtcTransaction;

      before(async () => {
         const fullTrans = await MccClient.getTransaction(txid);

         if (fullTrans) {
            transaction = new BtcTransaction(fullTrans.data);
            await transaction.makeFullPayment(MccClient);
         }
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq("4d58bd737d87eb2011ba7e0d33d3a0c8f94f13020dd096f8d1b96849c9660a53");
      });

      it("Should get standardized txid ", async function () {
         expect(transaction.stdTxid).to.eq("4d58bd737d87eb2011ba7e0d33d3a0c8f94f13020dd096f8d1b96849c9660a53");
      });

      it("Should get transaction hash ", async function () {
         expect(transaction.hash).to.eq("c16f1d89e5e82ecfebe57f3ff5fc1c7a6144964a133da24ec3216965cf787cfd");
      });

      it("Should get transaction reference array ", async function () {
         expect(transaction.reference.length).to.eq(0);
      });

      it("Should get standardized transaction reference ", async function () {
         expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
      });

      it("Should get transaction timestamp ", async function () {
         // From https://blockstream.info/tx/4d58bd737d87eb2011ba7e0d33d3a0c8f94f13020dd096f8d1b96849c9660a53
         expect(transaction.unixTimestamp).to.eq(1650342330);
      });

      it("Should get source address ", async function () {
         expect(transaction.sourceAddresses.length).to.eq(2);
         expect(transaction.sourceAddresses[0]).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
         expect(transaction.sourceAddresses[1]).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
      });

      it("Should get receiving address ", async function () {
         expect(transaction.receivingAddresses.length).to.eq(2);
         expect(transaction.receivingAddresses[0]).to.eq("1KiJkugknjgW6AHXNgVQgNuo3b5DqsVFmk");
         expect(transaction.receivingAddresses[1]).to.eq("bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej");
      });

      it("Should get fee ", async function () {
         expect(transaction.fee.toNumber()).to.eq(40000);
      });

      it("Should spend amount ", async function () {
         expect(transaction.spentAmounts.length).to.eq(2);
         expect(transaction.spentAmounts[0].address).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
         expect(transaction.spentAmounts[0].amount.toNumber()).to.eq(400000000);
         expect(transaction.spentAmounts[1].address).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
         expect(transaction.spentAmounts[1].amount.toNumber()).to.eq(400000000);
      });

      it("Should received amount ", async function () {
         expect(transaction.receivedAmounts.length).to.eq(2);
         expect(transaction.receivedAmounts[0].address).to.eq("1KiJkugknjgW6AHXNgVQgNuo3b5DqsVFmk");
         expect(transaction.receivedAmounts[0].amount.toNumber()).to.eq(494000000);
         expect(transaction.receivedAmounts[1].address).to.eq("bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej");
         expect(transaction.receivedAmounts[1].amount.toNumber()).to.eq(305960000);
      });

      it("Should get type ", async function () {
         expect(transaction.type).to.eq("full_payment");
      });

      it("Should check if native payment ", async function () {
         expect(transaction.isNativePayment).to.eq(true);
      });

      it("Should get currency name ", async function () {
         expect(transaction.currencyName).to.eq("BTC");
      });

      it("Should get elementary unit ", async function () {
         expect(transaction.elementaryUnits.toNumber()).to.eq(100000000);
      });

      it("Should get success status ", async function () {
         expect(transaction.successStatus).to.eq(0);
      });

      it("Should get payment summary from utxo 0 to utxo 0", async function () {
         const summary = await transaction.paymentSummary(MccClient, 0, 0, false);

         expect(summary.isNativePayment).to.eq(true);
         expect(summary.sourceAddress).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
         expect(summary.receivingAddress).to.eq("1KiJkugknjgW6AHXNgVQgNuo3b5DqsVFmk");
         expect(summary.spentAmount?.toNumber()).to.eq(800000000);
         expect(summary.receivedAmount?.toNumber()).to.eq(494000000);
         expect(summary.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         expect(summary.oneToOne).to.eq(false);
         expect(summary.isFull).to.eq(true);
      });

      it("Should get payment summary from utxo 0 to utxo 1", async function () {
         const summary = await transaction.paymentSummary(MccClient, 0, 1, false);

         expect(summary.isNativePayment).to.eq(true);
         expect(summary.sourceAddress).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
         expect(summary.receivingAddress).to.eq("bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej");
         expect(summary.spentAmount?.toNumber()).to.eq(800000000);
         expect(summary.receivedAmount?.toNumber()).to.eq(305960000);
         expect(summary.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         expect(summary.oneToOne).to.eq(false);
         expect(summary.isFull).to.eq(true);
      });

      it("Should get payment summary from utxo 1 to utxo 0", async function () {
         const summary = await transaction.paymentSummary(MccClient, 1, 0, false);

         expect(summary.isNativePayment).to.eq(true);
         expect(summary.sourceAddress).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
         expect(summary.receivingAddress).to.eq("1KiJkugknjgW6AHXNgVQgNuo3b5DqsVFmk");
         expect(summary.spentAmount?.toNumber()).to.eq(800000000);
         expect(summary.receivedAmount?.toNumber()).to.eq(494000000);
         expect(summary.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         expect(summary.oneToOne).to.eq(false);
         expect(summary.isFull).to.eq(true);
      });

      it("Should get payment summary from utxo 1 to utxo 1", async function () {
         const summary = await transaction.paymentSummary(MccClient, 1, 1, false);

         expect(summary.isNativePayment).to.eq(true);
         expect(summary.sourceAddress).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
         expect(summary.receivingAddress).to.eq("bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej");
         expect(summary.spentAmount?.toNumber()).to.eq(800000000);
         expect(summary.receivedAmount?.toNumber()).to.eq(305960000);
         expect(summary.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         expect(summary.oneToOne).to.eq(false);
         expect(summary.isFull).to.eq(true);
      });
   });
});
