import { expect } from "chai";
import { AlgoBlock, AlgoNodeStatus, AlgoTransaction, MCC } from "../../src";
import { traceManager } from "../../src/utils/trace";

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
};

describe("Algo transaction in block (Expect block 21_659_776 in node) ", function () {
   let MccClient: MCC.ALGO;
   let block: AlgoBlock;

   before(async function () {
      MccClient = new MCC.ALGO(algoCreateConfig);
      block = await MccClient.getBlock(21_659_776);
   });

   describe("NativePayment transaction in block ", function () {
      let transaction: AlgoTransaction;
      // https://algoexplorer.io/tx/TQA6RDIWO6FINMAJDQSMTKJTOCFO5CCXTWR2DWZJPZWDVAUZ4WQQ
      const txId = "TQA6RDIWO6FINMAJDQSMTKJTOCFO5CCXTWR2DWZJPZWDVAUZ4WQQ";

      before(async function () {
         for (let txOb of block.transactions) {
            if (txOb.txid === txId) {
               transaction = txOb;
            }
         }
      });

      it("Should find transaction in block ", function () {
         expect(transaction).to.not.eq(undefined);
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq(txId);
      });

      it("Should get standardized txid ", async function () {
         expect(transaction.stdTxid).to.eq("9c01e88d16778a86b0091c24c9a933708aee88579da3a1db297e6c3a8299e5a1");
      });

      it("Should get transaction hash ", async function () {
         expect(transaction.hash).to.eq(txId);
      });

      it("Should get transaction reference array ", async function () {
         expect(transaction.reference.length).to.eq(1);
      });

      it("Should get standardized transaction reference ", async function () {
         expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
      });

      it("Should get transaction timestamp ", async function () {
         expect(transaction.unixTimestamp).to.eq(1655413908);
      });

      it("Should get source address ", async function () {
         expect(transaction.sourceAddresses.length).to.eq(1);
         expect(transaction.sourceAddresses[0]).to.eq("XNFT36FUCFRR6CK675FW4BEBCCCOJ4HOSMGCN6J2W6ZMB34KM2ENTNQCP4");
      });

      it("Should get receiving address ", async function () {
         expect(transaction.receivingAddresses.length).to.eq(1);
         expect(transaction.receivingAddresses[0]).to.eq("5VA3MVA4SPRDSXK4X3YJJNCAO23SP4H57XLKZHRXZ3V7HRCF4BK4P66AJ4");
      });

      it("Should get fee ", async function () {
         expect(transaction.fee.toNumber()).to.eq(1000);
      });

      it("Should spend amount ", async function () {
         expect(transaction.spentAmounts.length).to.eq(1);
         expect(transaction.spentAmounts[0].address).to.eq("XNFT36FUCFRR6CK675FW4BEBCCCOJ4HOSMGCN6J2W6ZMB34KM2ENTNQCP4");
         expect(transaction.spentAmounts[0].amount.toNumber()).to.eq(251000);
      });

      it("Should received amount ", async function () {
         expect(transaction.receivedAmounts.length).to.eq(1);
         expect(transaction.receivedAmounts[0].address).to.eq("5VA3MVA4SPRDSXK4X3YJJNCAO23SP4H57XLKZHRXZ3V7HRCF4BK4P66AJ4");
         expect(transaction.receivedAmounts[0].amount.toNumber()).to.eq(250000);
      });

      it("Should get type ", async function () {
         expect(transaction.type).to.eq("pay");
      });

      it("Should check if native payment ", async function () {
         expect(transaction.isNativePayment).to.eq(true);
      });

      it("Should get currency name ", async function () {
         expect(transaction.currencyName).to.eq("ALGO");
      });

      it("Should get elementary unit ", async function () {
         expect(transaction.elementaryUnits.toNumber()).to.eq(1000000);
      });

      it("Should get success status ", async function () {
         expect(transaction.successStatus).to.eq(0);
      });

      it("Should get payment summary", async function () {
         const summary = await transaction.paymentSummary(MccClient);

         expect(summary.isNativePayment).to.eq(true);
         expect(summary.sourceAddress).to.eq("XNFT36FUCFRR6CK675FW4BEBCCCOJ4HOSMGCN6J2W6ZMB34KM2ENTNQCP4");
         expect(summary.receivingAddress).to.eq("5VA3MVA4SPRDSXK4X3YJJNCAO23SP4H57XLKZHRXZ3V7HRCF4BK4P66AJ4");
         expect(summary.spentAmount?.toNumber()).to.eq(251000);
         expect(summary.receivedAmount?.toNumber()).to.eq(250000);
         expect(summary.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         expect(summary.oneToOne).to.eq(true);
         expect(summary.isFull).to.eq(true);
      });
   });
});
