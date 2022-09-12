import { AlgoBlock, AlgoTransaction, MCC } from "../../src";
import { AlgoIndexerTransaction } from "../../src/base-objects/transactions/AlgoIndexerTransaction";
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
   indexer: {
      url: process.env.ALGO_INDEXER_URL || "",
      token: process.env.ALGO_INDEXER_TOKEN || "",
   },
};

const hei = 21_374_440;

describe(`Algo transaction from algod block VS from indexer compare`, function () {
   it("Should do something", function () {
      expect(3).to.eq(3);
   });
   let MccClient: MCC.ALGO;
   let block: AlgoBlock;
   MccClient = new MCC.ALGO(algoCreateConfig);

   before(async function () {
      block = await MccClient.getBlock(hei);
   });
   describe(`Comparing transactions for ${hei}`, function () {
      for (let tra of block.transactions) {
         let BTrans: AlgoTransaction;
         let ITrans: AlgoIndexerTransaction;
         it("Should compare transaction txid ", function () {
            expect(1).to.eq(1);
         });
         BTrans = tra;

         before(async function () {
            MccClient = new MCC.ALGO(algoCreateConfig);
            ITrans = await MccClient.getIndexerTransaction(BTrans.txid);
         });

         it("Should compare transaction txid ", function () {
            expect(BTrans.txid).to.eq(ITrans.txid);
         });

         it("Should compare transaction hash ", async function () {
            expect(BTrans.hash).to.eq(ITrans.hash);
         });

         it("Should compare transaction std txid ", async function () {
            expect(BTrans.stdTxid).to.eq(ITrans.stdTxid);
         });

         it("Should compare transaction reference ", async function () {
            expect(BTrans.reference.length).to.eq(ITrans.reference.length);
            ITrans.reference.sort();
            BTrans.reference.sort();
            for (let i = 0; i < BTrans.reference.length; i++) {
               expect(BTrans.reference[i]).to.eq(ITrans.reference[i]);
            }
         });

         it("Should compare transaction stdPaymentReference ", async function () {
            expect(BTrans.stdPaymentReference).to.eq(ITrans.stdPaymentReference);
         });

         it("Should compare transaction std txid ", async function () {
            expect(BTrans.stdTxid).to.eq(ITrans.stdTxid);
         });

         it("Should compare transaction unix timestamp ", async function () {
            expect(BTrans.unixTimestamp).to.eq(ITrans.unixTimestamp);
         });

         it("Should compare transaction sourceAddresses ", async function () {
            expect(BTrans.sourceAddresses.length).to.eq(ITrans.sourceAddresses.length);
            ITrans.sourceAddresses.sort();
            BTrans.sourceAddresses.sort();
            for (let i = 0; i < BTrans.sourceAddresses.length; i++) {
               expect(BTrans.sourceAddresses[i]).to.eq(ITrans.sourceAddresses[i]);
            }
         });

         it("Should compare transaction receivingAddresses ", async function () {
            expect(BTrans.receivingAddresses.length).to.eq(ITrans.receivingAddresses.length);
            ITrans.receivingAddresses.sort();
            BTrans.receivingAddresses.sort();
            for (let i = 0; i < BTrans.receivingAddresses.length; i++) {
               expect(BTrans.receivingAddresses[i]).to.eq(ITrans.receivingAddresses[i]);
            }
         });

         it("Should compare transaction fee ", async function () {
            expect(BTrans.fee.toString()).to.eq(ITrans.fee.toString());
         });

         it("Should compare transaction spentAmounts ", async function () {
            expect(BTrans.spentAmounts.length).to.eq(ITrans.spentAmounts.length);
            ITrans.spentAmounts.sort();
            BTrans.spentAmounts.sort();
            for (let i = 0; i < BTrans.spentAmounts.length; i++) {
               if (ITrans.spentAmounts[i].address && BTrans.spentAmounts[i].address) {
                  expect(BTrans.spentAmounts[i].address).to.eq(ITrans.spentAmounts[i].address);
               }
               expect(BTrans.spentAmounts[i].amount.toString()).to.eq(ITrans.spentAmounts[i].amount.toString());
            }
         });

         it("Should compare transaction receivedAmounts ", async function () {
            expect(BTrans.receivedAmounts.length).to.eq(ITrans.receivedAmounts.length);
            ITrans.receivedAmounts.sort();
            BTrans.receivedAmounts.sort();
            for (let i = 0; i < BTrans.receivedAmounts.length; i++) {
               if (ITrans.receivedAmounts[i].address && BTrans.receivedAmounts[i].address) {
                  expect(BTrans.receivedAmounts[i].address).to.eq(ITrans.receivedAmounts[i].address);
               }
               expect(BTrans.receivedAmounts[i].amount.toString()).to.eq(ITrans.receivedAmounts[i].amount.toString());
            }
         });

         it("Should compare transaction type ", async function () {
            expect(BTrans.type).to.eq(ITrans.type);
         });

         it("Should compare transaction isNativePayment ", async function () {
            expect(BTrans.isNativePayment).to.eq(ITrans.isNativePayment);
         });

         it("Should compare transaction currencyName ", async function () {
            expect(BTrans.currencyName).to.eq(ITrans.currencyName);
         });

         it("Should compare transaction elementaryUnits ", async function () {
            expect(BTrans.elementaryUnits.toString()).to.eq(ITrans.elementaryUnits.toString());
         });

         it("Should compare transaction successStatus ", async function () {
            expect(BTrans.successStatus).to.eq(ITrans.successStatus);
         });

         it("Should compare transaction payment summary ", async function () {
            const sum1 = await BTrans.paymentSummary();
            const sum2 = await ITrans.paymentSummary();
            for (let key in sum1) {
               expect(sum1.hasOwnProperty(key)).to.eq(sum2.hasOwnProperty(key));
               // @ts-ignore
               expect(sum1[key]).to.eq(sum2[key]);
            }
         });
      }
   });
});
