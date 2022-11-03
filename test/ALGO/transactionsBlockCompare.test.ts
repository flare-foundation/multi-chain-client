import { expect } from "chai";
import { AlgoBlock, AlgoTransaction, MCC } from "../../src";
import { AlgoIndexerTransaction } from "../../src/base-objects/transactions/AlgoIndexerTransaction";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

//TODO: cannnot call mix describe w/ async

const hei = 21_374_440;

type TxPair = {
   BTrans: AlgoTransaction;
   ITrans: AlgoIndexerTransaction;
};

describe(`Algo transaction from algod block ${hei} VS from indexer compare`, function () {
   let block: AlgoBlock;
   const MccClient = new MCC.ALGO(algoCreateConfig);

   const txPairs: TxPair[] = [];
   before(async function () {
      block = await MccClient.getBlock(hei);

      for (const tra of block.transactions) {
         const iTrans = await MccClient.getIndexerTransaction(tra.txid);
         if (iTrans) {
            txPairs.push({ BTrans: tra, ITrans: iTrans } as TxPair);
         }
      }
   });

   it("Should compare transaction hash ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.hash).to.eq(pair.ITrans.hash);
      }
   });

   it("Should compare transaction std txid ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.stdTxid).to.eq(pair.ITrans.stdTxid);
      }
   });

   it("Should compare transaction reference ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.reference.length).to.eq(pair.ITrans.reference.length);
         pair.ITrans.reference.sort();
         pair.BTrans.reference.sort();
         for (let i = 0; i < pair.BTrans.reference.length; i++) {
            expect(pair.BTrans.reference[i]).to.eq(pair.ITrans.reference[i]);
         }
      }
   });

   it("Should compare transaction stdPaymentReference ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.stdPaymentReference).to.eq(pair.ITrans.stdPaymentReference);
      }
   });

   it("Should compare transaction std txid ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.stdTxid).to.eq(pair.ITrans.stdTxid);
      }
   });

   it("Should compare transaction unix timestamp ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.unixTimestamp).to.eq(pair.ITrans.unixTimestamp);
      }
   });

   // TODO: sort out source?receiving... !== assetSource/Receiving....

   // it("Should compare transaction sourceAddresses ", async function () {
   //    for (let pair of txPairs) {
   //       expect(pair.BTrans.sourceAddresses.length).to.eq(pair.ITrans.sourceAddresses.length);
   //       pair.ITrans.sourceAddresses.sort();
   //       pair.BTrans.sourceAddresses.sort();
   //       for (let i = 0; i < pair.BTrans.sourceAddresses.length; i++) {
   //          expect(pair.BTrans.sourceAddresses[i]).to.eq(pair.ITrans.sourceAddresses[i]);
   //       }
   //    }
   // });

   // it("Should compare transaction receivingAddresses ", async function () {
   //    for (let pair of txPairs) {
   //       expect(pair.BTrans.receivingAddresses.length).to.eq(pair.ITrans.receivingAddresses.length);
   //       pair.ITrans.receivingAddresses.sort();
   //       pair.BTrans.receivingAddresses.sort();
   //       for (let i = 0; i < pair.BTrans.receivingAddresses.length; i++) {
   //          expect(pair.BTrans.receivingAddresses[i]).to.eq(pair.ITrans.receivingAddresses[i]);
   //       }
   //    }
   // });

   it("Should compare transaction fee ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.fee.toString()).to.eq(pair.ITrans.fee.toString());
      }
   });

   // it("Should compare transaction spentAmounts ", async function () {
   //    expect(BTrans.spentAmounts.length).to.eq(ITrans.spentAmounts.length);
   //    ITrans.spentAmounts.sort();
   //    BTrans.spentAmounts.sort();
   //    for (let i = 0; i < BTrans.spentAmounts.length; i++) {
   //       if (ITrans.spentAmounts[i].address && BTrans.spentAmounts[i].address) {
   //          expect(BTrans.spentAmounts[i].address).to.eq(ITrans.spentAmounts[i].address);
   //       }
   //       expect(BTrans.spentAmounts[i].amount.toString()).to.eq(ITrans.spentAmounts[i].amount.toString());
   //    }
   // });

   // it("Should compare transaction receivedAmounts ", async function () {
   //    expect(BTrans.receivedAmounts.length).to.eq(ITrans.receivedAmounts.length);
   //    ITrans.receivedAmounts.sort();
   //    BTrans.receivedAmounts.sort();
   //    for (let i = 0; i < BTrans.receivedAmounts.length; i++) {
   //       if (ITrans.receivedAmounts[i].address && BTrans.receivedAmounts[i].address) {
   //          expect(BTrans.receivedAmounts[i].address).to.eq(ITrans.receivedAmounts[i].address);
   //       }
   //       expect(BTrans.receivedAmounts[i].amount.toString()).to.eq(ITrans.receivedAmounts[i].amount.toString());
   //    }
   // });

   it("Should compare transaction type ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.type).to.eq(pair.ITrans.type);
      }
   });

   it("Should compare transaction isNativePayment ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.isNativePayment).to.eq(pair.ITrans.isNativePayment);
      }
   });

   it("Should compare transaction currencyName ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.currencyName).to.eq(pair.ITrans.currencyName);
      }
   });

   it("Should compare transaction elementaryUnits ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.elementaryUnits.toString()).to.eq(pair.ITrans.elementaryUnits.toString());
      }
   });

   it("Should compare transaction successStatus ", async function () {
      for (const pair of txPairs) {
         expect(pair.BTrans.successStatus).to.eq(pair.ITrans.successStatus);
      }
   });

   // it("Should compare transaction payment summary ", async function () {
   //    const sum1 = await BTrans.paymentSummary();
   //    const sum2 = await ITrans.paymentSummary();
   //    for (let key in sum1) {
   //       expect(sum1.hasOwnProperty(key)).to.eq(sum2.hasOwnProperty(key));
   //       // @ts-ignore
   //       expect(sum1[key]).to.eq(sum2[key]);
   //    }
   // });
});
