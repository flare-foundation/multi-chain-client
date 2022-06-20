import { expect } from "chai";
import { MCC, UtxoBlock, UtxoMccCreate } from "../../src";

const BtcMccConnection = {
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Template test ", function () {
   let MccClient: MCC.BTC;
   let block: UtxoBlock;
   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   it("Should temp test ", async function () {
      const trans = await MccClient.getTransaction("a8e7ec78e5ee9589a93b937ac2f2c34a46b94571faeb8a52e8ca85c9c7b09d02");
      const newTrans = await trans.paymentSummary(MccClient, 1, 1, true);

      expect(newTrans.isNativePayment).to.eq(true);
      expect(newTrans.sourceAddress).to.eq("12sFAbHEY3bChUrvb58V4R6KBau2QcGryg");
      expect(newTrans.receivingAddress).to.eq("39sEzBtK23FStf7R7jqgE4z2q2cxKgTLrD");
      expect(newTrans.spentAmount?.toNumber()).to.eq(500000000);
      expect(newTrans.receivedAmount?.toNumber()).to.eq(185064);
      expect(newTrans.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
      expect(newTrans.oneToOne).to.eq(false);
      expect(newTrans.isFull).to.eq(true);
   });

   // A test to find some transactions on btc node that have op-return script entry and are not block mining transactions
   it.skip("Should find op return trans", async () => {
      const h = await MccClient.getBlockHeight();
      const block = await MccClient.getBlock(h);
      console.log(block?.blockHash);

      for (let i = 7; i < 20; i++) {
         const bl = await MccClient.getBlock(h - i);
         if (bl) {
            for (let tran of bl.stdTransactionIds) {
               const t = await MccClient.getTransaction(tran);
               if (t) {
                  if (t.type !== "coinbase" && t.reference.length > 0) {
                     console.log(t.stdTxid);
                     break;
                  }
               }
            }
         }
      }
   });
});
