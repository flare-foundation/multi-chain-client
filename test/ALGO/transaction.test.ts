import { AlgoBlock, AlgoTransaction, MCC, toBN, TransactionSuccessStatus } from "../../src";
import { algoTransactionTestCases } from "../testUtils";
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
};

const TransactionsToTest: algoTransactionTestCases[] = [
   {
      description: "NativePayment transaction in block ",
      txid: "TQA6RDIWO6FINMAJDQSMTKJTOCFO5CCXTWR2DWZJPZWDVAUZ4WQQ",
      block: 21_659_776,
      expect: {
         txid: "TQA6RDIWO6FINMAJDQSMTKJTOCFO5CCXTWR2DWZJPZWDVAUZ4WQQ",
         stdTxid: "9c01e88d16778a86b0091c24c9a933708aee88579da3a1db297e6c3a8299e5a1",
         hash: "TQA6RDIWO6FINMAJDQSMTKJTOCFO5CCXTWR2DWZJPZWDVAUZ4WQQ",
         reference: [],
         stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
         unixTimestamp: 1655413908,
         sourceAddresses: ["XNFT36FUCFRR6CK675FW4BEBCCCOJ4HOSMGCN6J2W6ZMB34KM2ENTNQCP4"],
         receivingAddresses: ["5VA3MVA4SPRDSXK4X3YJJNCAO23SP4H57XLKZHRXZ3V7HRCF4BK4P66AJ4"],
         isFeeError: false,
         fee: "1000", // number as a string
         spentAmounts: [
            {
               address: "XNFT36FUCFRR6CK675FW4BEBCCCOJ4HOSMGCN6J2W6ZMB34KM2ENTNQCP4",
               amount: toBN(251000),
            },
         ],
         receivedAmounts: [
            {
               address: "5VA3MVA4SPRDSXK4X3YJJNCAO23SP4H57XLKZHRXZ3V7HRCF4BK4P66AJ4",
               amount: toBN(250000),
            },
         ],
         type: "pay",
         isNativePayment: true,
         currencyName: "ALGO",
         elementaryUnits: "1000000", // number as string
         successStatus: TransactionSuccessStatus.SUCCESS,
      },
   },
   {
      description: "Transaction with one flare reference",
      txid: "2DWIMCX2EUXG2A5PJ55DRNENT5HRHMW7CHBAMY5IWXAA7QWPDHLA",
      block: 21_059_610,
      expect: {
         txid: "2DWIMCX2EUXG2A5PJ55DRNENT5HRHMW7CHBAMY5IWXAA7QWPDHLA",
         stdTxid: "d0ec860afa252e6d03af4f7a38b48d9f4f13b2df11c20663a8b5c00fc2cf19d6",
         hash: "2DWIMCX2EUXG2A5PJ55DRNENT5HRHMW7CHBAMY5IWXAA7QWPDHLA",
         reference: ["34346435623437313864366262386461613139336330663361643237323630346464303335326165306536323733616139336436623236323233393533313362"],
         stdPaymentReference: "0x44d5b4718d6bb8daa193c0f3ad272604dd0352ae0e6273aa93d6b2622395313b",
         unixTimestamp: 1652801756,
         sourceAddresses: ["A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A"],
         receivingAddresses: ["A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A"],
         isFeeError: false,
         fee: "1000", // number as a string
         spentAmounts: [
            {
               address: "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A",
               amount: toBN(1001000),
            },
         ],
         receivedAmounts: [
            {
               address: "A3ANPGC7VYWWJPQUXG2NTVNQPM67BEY3V4AYFDZMA25WYD7FAC5KOCCN4A",
               amount: toBN(1000000),
            },
         ],
         type: "pay",
         isNativePayment: true,
         currencyName: "ALGO",
         elementaryUnits: "1000000", // number as string
         successStatus: TransactionSuccessStatus.SUCCESS,
      },
   },
   {
    description: "Axfer trasnaction ",
    txid: "TTHNP33PA6H54XVOVIT6YVRDFDIWFPX7XONUROZIGWVYO2QWYCLQ",
    block: 21_731_318,
    expect: {
       txid: "TTHNP33PA6H54XVOVIT6YVRDFDIWFPX7XONUROZIGWVYO2QWYCLQ",
       stdTxid: "9cced7ef6f078fde5eaeaa27ec562328d162beffbb9b48bb2835ab876a16c097",
       hash: "TTHNP33PA6H54XVOVIT6YVRDFDIWFPX7XONUROZIGWVYO2QWYCLQ",
       reference: ["7b2269223a223137343063313935306631353037383333346365393638333337643362336332222c2277223a223030656131623137633962303232333133356234646330636262656138383136222c227772223a313539302c227764223a31382c2262223a223966636561353139636530353036623730376163613730636238333739386235222c226272223a313536332c226264223a2d352c2266223a22323032322d30322d30335430373a33333a30375a227d"],
       stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
       unixTimestamp: 1655724084,
       sourceAddresses: ["C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34"],
       receivingAddresses: ["C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34"],
       isFeeError: false,
       fee: "1000", // number as a string
       spentAmounts: [
          {
             address: "C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34",
             amount: toBN(1001),
          },
       ],
       receivedAmounts: [
          {
             address: "C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34",
             amount: toBN(1),
          },
       ],
       type: "axfer",
       isNativePayment: false,
       currencyName: "127745593",
       elementaryUnits: "1000000", // number as string
       successStatus: TransactionSuccessStatus.SUCCESS,
    },
 },
 {
  description: "Config call trasnaction ",
  txid: "76G2UTQWVG4FMWV4ZQCIUNJX2XRKLJMIDRB444LYQPDGNE3KZVUA",
  block: 21_731_318,
  expect: {
     txid: "76G2UTQWVG4FMWV4ZQCIUNJX2XRKLJMIDRB444LYQPDGNE3KZVUA",
     stdTxid: "ff8daa4e16a9b8565abccc048a3537d5e2a5a5881c43ce717883c666936acd68",
     hash: "76G2UTQWVG4FMWV4ZQCIUNJX2XRKLJMIDRB444LYQPDGNE3KZVUA",
     reference: [],
     stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
     unixTimestamp: 1655724084,
     sourceAddresses: ["54LSG3HXFK2IK3WYBCNSSAXWDVOSSDNJ2J3NJC3YOGYKOTPXVDOSQHDAJI"],
     receivingAddresses: [],
     isFeeError: false,
     fee: "1000", // number as a string
     spentAmounts: [
        {
           address: "54LSG3HXFK2IK3WYBCNSSAXWDVOSSDNJ2J3NJC3YOGYKOTPXVDOSQHDAJI",
           amount: toBN(1000),
        },
     ],
     receivedAmounts: [],
     type: "acfg",
     isNativePayment: false,
     currencyName: "",
     elementaryUnits: "1000000", // number as string
     successStatus: TransactionSuccessStatus.SUCCESS,
  },
},

 
];

for (let transData of TransactionsToTest) {
   describe(`Algo transaction in block (Expect block ${transData.block} in node) `, function () {
      let MccClient: MCC.ALGO;
      let block: AlgoBlock;

      before(async function () {
         MccClient = new MCC.ALGO(algoCreateConfig);
         block = await MccClient.getBlock(transData.block);
      });

      it("Should get blocks ", async function () {
         expect(block).to.not.eq(undefined);
         expect(block).to.not.eq(null);
      });

      describe(`${transData.description}`, function () {
         let transaction: AlgoTransaction;
         // https://algoexplorer.io/tx/TQA6RDIWO6FINMAJDQSMTKJTOCFO5CCXTWR2DWZJPZWDVAUZ4WQQ

         before(async function () {
            for (let txOb of block.transactions) {
               if (txOb.txid === transData.txid) {
                  transaction = txOb;
               }
            }
         });

         it("Should find transaction in block ", function () {
            expect(transaction).to.not.eq(undefined);
         });

         it("Should get transaction txid ", async function () {
            expect(transaction.txid).to.eq(transData.expect.txid);
         });

         it("Should get standardized txid ", async function () {
            expect(transaction.stdTxid).to.eq(transData.expect.stdTxid);
         });

         it("Should get transaction hash ", async function () {
            expect(transaction.hash).to.eq(transData.expect.hash);
         });

         it("Should get transaction reference array ", async function () {
            expect(transaction.reference.length).to.eq(transData.expect.reference.length);
            const a = transaction.reference.sort();
            const b = transData.expect.reference.sort();
            for (let i = 0; i < a.length; i++) {
               expect(a[i]).to.eq(b[i]);
            }
         });

         it("Should get standardized transaction reference ", async function () {
            expect(transaction.stdPaymentReference).to.eq(transData.expect.stdPaymentReference);
         });

         it("Should get transaction timestamp ", async function () {
            expect(transaction.unixTimestamp).to.eq(transData.expect.unixTimestamp);
         });

         it("Should get source address ", async function () {
            expect(transaction.sourceAddresses.length).to.eq(transData.expect.sourceAddresses.length);
            const a = transaction.sourceAddresses.sort();
            const b = transData.expect.sourceAddresses.sort();
            for (let i = 0; i < a.length; i++) {
               expect(a[i]).to.eq(b[i]);
            }
         });

         it("Should get receiving address ", async function () {
            expect(transaction.receivingAddresses.length).to.eq(transData.expect.receivingAddresses.length);
            const a = transaction.receivingAddresses.sort();
            const b = transData.expect.receivingAddresses.sort();
            for (let i = 0; i < a.length; i++) {
               expect(a[i]).to.eq(b[i]);
            }
         });

         it("Should get fee ", async function () {
            if (transData.expect.isFeeError) {
               expect(function () {
                  transaction.fee;
               }).to.throw(transData.expect.fee);
            } else {
               expect(transaction.fee.toString()).to.eq(transData.expect.fee);
            }
         });

         it("Should spend amount ", async function () {
            expect(transaction.spentAmounts.length).to.eq(transData.expect.spentAmounts.length);
            const a = transaction.spentAmounts.sort();
            const b = transData.expect.spentAmounts.sort();
            for (let i = 0; i < a.length; i++) {
               expect(a[i].address).to.eq(b[i].address);
               expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
            }
         });

         it("Should received amount ", async function () {
            expect(transaction.receivedAmounts.length).to.eq(transData.expect.receivedAmounts.length);
            const a = transaction.receivedAmounts.sort();
            const b = transData.expect.receivedAmounts.sort();
            for (let i = 0; i < a.length; i++) {
               expect(a[i].address).to.eq(b[i].address);
               expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
            }
         });

         it("Should get type ", async function () {
            expect(transaction.type).to.eq(transData.expect.type);
         });

         it("Should check if native payment ", async function () {
            expect(transaction.isNativePayment).to.eq(transData.expect.isNativePayment);
         });

         it("Should get currency name ", async function () {
            expect(transaction.currencyName).to.eq(transData.expect.currencyName);
         });

         it("Should get elementary unit ", async function () {
            expect(transaction.elementaryUnits.toString()).to.eq(transData.expect.elementaryUnits);
         });

         it("Should get success status ", async function () {
            expect(transaction.successStatus).to.eq(transData.expect.successStatus);
         });

         it("Should get payment summary", async function () {
            const summary = await transaction.paymentSummary(MccClient);

            if(transData.expect.isNativePayment){
              expect(summary.isNativePayment).to.eq(transData.expect.isNativePayment);
              expect(summary.sourceAddress).to.eq(transData.expect.sourceAddresses[0]);
              expect(summary.receivingAddress).to.eq(transData.expect.receivingAddresses[0]);
              expect(summary.spentAmount?.toString()).to.eq(transData.expect.spentAmounts[0].amount.toString());
              expect(summary.receivedAmount?.toString()).to.eq(transData.expect.receivedAmounts[0].amount.toString());
              expect(summary.paymentReference).to.eq(transData.expect.stdPaymentReference);
              expect(summary.oneToOne).to.eq(true);
              expect(summary.isFull).to.eq(true);
            }
            else {
              expect(summary.isNativePayment).to.eq(transData.expect.isNativePayment);
            }
         });
      });
   });
}


it("Should get invalid method call ", async function () {
   let MccClient = new MCC.ALGO(algoCreateConfig);
   await expect(MccClient.getTransaction("")).to.be.rejectedWith("InvalidMethodCall");
});

it("Should not list transactions ", async function () {
   let MccClient = new MCC.ALGO(algoCreateConfig);
   let res = await MccClient.listTransactions();
   expect(res).to.be.null;
});
