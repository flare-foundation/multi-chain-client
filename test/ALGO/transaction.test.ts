import { assert } from "console";
import { AlgoBlock, AlgoTransaction, MCC, toBN, TransactionSuccessStatus } from "../../src";
import { mccError } from "../../src/utils/errors";
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
      description: "Axfer transaction ",
      txid: "TTHNP33PA6H54XVOVIT6YVRDFDIWFPX7XONUROZIGWVYO2QWYCLQ",
      block: 21_731_318,
      expect: {
         txid: "TTHNP33PA6H54XVOVIT6YVRDFDIWFPX7XONUROZIGWVYO2QWYCLQ",
         stdTxid: "9cced7ef6f078fde5eaeaa27ec562328d162beffbb9b48bb2835ab876a16c097",
         hash: "TTHNP33PA6H54XVOVIT6YVRDFDIWFPX7XONUROZIGWVYO2QWYCLQ",
         reference: [
            "7b2269223a223137343063313935306631353037383333346365393638333337643362336332222c2277223a223030656131623137633962303232333133356234646330636262656138383136222c227772223a313539302c227764223a31382c2262223a223966636561353139636530353036623730376163613730636238333739386235222c226272223a313536332c226264223a2d352c2266223a22323032322d30322d30335430373a33333a30375a227d",
         ],
         stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
         unixTimestamp: 1655724084,
         sourceAddresses: ["C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34"],
         receivingAddresses: ["C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34"],
         isFeeError: false,
         fee: "1000", // number as a string
         spentAmounts: [
            {
               address: "C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34",
               amount: toBN(1),
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
   {
      description: "Transaction with clawback  ",
      txid: "O4PGGEM3ZCA27SQHCJH4VBTB3FYM7FJNRF2ROOGFQRI4BSYWPKLQ",
      block: 21_891_197,
      expect: {
         txid: "O4PGGEM3ZCA27SQHCJH4VBTB3FYM7FJNRF2ROOGFQRI4BSYWPKLQ",
         stdTxid: "771e63119bc881afca07124fca8661d970cf952d89751738c58451c0cb167a97",
         hash: "O4PGGEM3ZCA27SQHCJH4VBTB3FYM7FJNRF2ROOGFQRI4BSYWPKLQ",
         reference: [],
         stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
         unixTimestamp: 1656417894,
         sourceAddresses: ["7NAM7FMTE2KUMWVDSS5AYXISMPKERQRXHNPICP257R6VKZVO4GOOFM7XIQ"],
         receivingAddresses: ["FO2CF7U7GXHUFDUUWNOQ2RWLZGRVNMC6GA4IPEBKB6DM4PGOEDR7BMHP3U"],
         isFeeError: false,
         fee: "1000", // number as a string
         spentAmounts: [
            {
               address: "7NAM7FMTE2KUMWVDSS5AYXISMPKERQRXHNPICP257R6VKZVO4GOOFM7XIQ",
               amount: toBN(1),
            },
         ],
         receivedAmounts: [
            {
               address: "FO2CF7U7GXHUFDUUWNOQ2RWLZGRVNMC6GA4IPEBKB6DM4PGOEDR7BMHP3U",
               amount: toBN(1),
            },
         ],
         type: "axfer",
         isNativePayment: false,
         currencyName: "791265863",
         elementaryUnits: "1000000", // number as string
         successStatus: TransactionSuccessStatus.SUCCESS,
      },
   },
];

type testCase = {
   txtype: "pay" | "keyreg" | "acfg" | "axfer" | "afrz" | "appl";
   blockRound: number;
   txId: string;
};

const testCases: testCase[] = [
   {
      txtype: "pay",
      blockRound: 23209650,
      txId: "FKYHGG743YWRFB3ADC72XPZOFHJIPOP7PR47ORPYJ24BLPO4HESQ",
   },
   {
      txtype: "appl",
      blockRound: 23209700,
      txId: "3IKJYQY34QWWZZH6NU57PUNR4VBRAKHGZ7DBSDGNSXT3VVZW4H7Q",
   },
   {
      txtype: "appl",
      blockRound: 23209637,
      txId: "LGSMAZNDRYQATNU5OTRQTXD2DE366EMS7RXTQFPMLQ3YLU5RBNSA",
   },
   {
      txtype: "appl",
      blockRound: 23209701,
      txId: "652IL6KURTY4LXR3OSOUEACL3F4R2C6UO7SB23K62ERCIRD2QR3Q",
   },
   {
      txtype: "axfer",
      blockRound: 23208000,
      txId: "UBXYTOAVX75BN4CJNB3O5KVNY4JPI6X4W7QI6ADC3KSWW42HLZOQ",
   },
   {
      txtype: "afrz",
      blockRound: 22925932,
      txId: "T5Q5WIGJBGO2UL6PZGSBGQOSVYVKFWVSJ44NT5WFW6V36PRDLI2Q",
   },
   {
      txtype: "acfg",
      blockRound: 23329652,
      txId: "5N5XBKJJQIA35HPVNW5MNAQTJSKYAPFNEDZEPBLS5WI4ICYE5RPA",
   },
];

describe("Transaction id tests", function () {
   for (let testTx of testCases) {
      describe(`Should compute the right txid for ${testTx.txtype}`, function () {
         let MccClient: MCC.ALGO;
         let block: AlgoBlock;
         let transaction: AlgoTransaction;
         MccClient = new MCC.ALGO(algoCreateConfig);

         let round = testTx.blockRound;
         let txId = testTx.txId;
         before(async function () {
            let txId = testTx.txId;
            MccClient = new MCC.ALGO(algoCreateConfig);
            block = await MccClient.getBlock(round);
            for (let txOb of block.transactions) {
               if (txOb.txid === txId) {
                  transaction = txOb;
               }
            }
         });

         it("Should get blocks ", async function () {
            expect(block).to.not.eq(undefined);
            expect(block).to.not.eq(null);
         });

         it("Should find transaction in block ", function () {
            expect(transaction).to.not.eq(undefined);
         });

         it("Should get transaction txid ", async function () {
            expect(transaction.txid).to.eq(txId);
         });

         it("Should get type ", async function () {
            expect(transaction.type).to.eq(testTx.txtype);
         });
      });
   }
});

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
            if (transaction.type === "pay" || transaction.type === "pay_close") {
               expect(transaction.sourceAddresses.length).to.eq(transData.expect.sourceAddresses.length);
               const a = transaction.sourceAddresses.sort();
               const b = transData.expect.sourceAddresses.sort();
               for (let i = 0; i < a.length; i++) {
                  expect(a[i]).to.eq(b[i]);
               }
            }
            if (transaction.type === "axfer" || transaction.type === "axfer_close") {
               expect(transaction.assetSourceAddresses.length).to.eq(transData.expect.sourceAddresses.length);
               const a = transaction.assetSourceAddresses.sort();
               const b = transData.expect.sourceAddresses.sort();
               for (let i = 0; i < a.length; i++) {
                  expect(a[i]).to.eq(b[i]);
               }
            }
         });

         it("Should get receiving address ", async function () {
            if (transaction.type === "pay" || transaction.type === "pay_close") {
               expect(transaction.receivingAddresses.length).to.eq(transData.expect.receivingAddresses.length);
               const a = transaction.receivingAddresses.sort();
               const b = transData.expect.receivingAddresses.sort();
               for (let i = 0; i < a.length; i++) {
                  expect(a[i]).to.eq(b[i]);
               }
            }
            if (transaction.type === "axfer" || transaction.type === "axfer_close") {
               expect(transaction.assetReceivingAddresses.length).to.eq(transData.expect.receivingAddresses.length);
               const a = transaction.assetReceivingAddresses.sort();
               const b = transData.expect.receivingAddresses.sort();
               for (let i = 0; i < a.length; i++) {
                  expect(a[i]).to.eq(b[i]);
               }
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
            if (transaction.type === "pay" || transaction.type === "pay_close") {
               expect(transaction.spentAmounts.length).to.eq(transData.expect.spentAmounts.length);
               const a = transaction.spentAmounts.sort();
               const b = transData.expect.spentAmounts.sort();
               for (let i = 0; i < a.length; i++) {
                  expect(a[i].address).to.eq(b[i].address);
                  expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
               }
            }
            if (transaction.type === "axfer" || transaction.type === "axfer_close") {
               await transaction.makeFull(MccClient);
               expect(transaction.assetSpentAmounts.length).to.eq(transData.expect.spentAmounts.length);
               const a = transaction.assetSpentAmounts.sort();
               const b = transData.expect.spentAmounts.sort();
               for (let i = 0; i < a.length; i++) {
                  expect(a[i].address).to.eq(b[i].address);
                  expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
               }
            }
         });

         it("Should received amount ", async function () {
            if (transaction.type === "pay" || transaction.type === "pay_close") {
               expect(transaction.receivedAmounts.length).to.eq(transData.expect.receivedAmounts.length);
               const a = transaction.receivedAmounts.sort();
               const b = transData.expect.receivedAmounts.sort();
               for (let i = 0; i < a.length; i++) {
                  expect(a[i].address).to.eq(b[i].address);
                  expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
               }
            }
            if (transaction.type === "axfer" || transaction.type === "axfer_close") {
               await transaction.makeFull(MccClient);
               expect(transaction.assetReceivedAmounts.length).to.eq(transData.expect.receivedAmounts.length);
               const a = transaction.assetReceivedAmounts.sort();
               const b = transData.expect.receivedAmounts.sort();
               for (let i = 0; i < a.length; i++) {
                  expect(a[i].address).to.eq(b[i].address);
                  expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
               }
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
            //does not work for axfer yet

            if (transData.expect.type === "pay" || transData.expect.type === "pay_close") {
               const summary = await transaction.paymentSummary(MccClient);

               if (transData.expect.isNativePayment) {
                  expect(summary.isNativePayment).to.eq(transData.expect.isNativePayment);
                  expect(summary.sourceAddress).to.eq(transData.expect.sourceAddresses[0]);
                  expect(summary.receivingAddress).to.eq(transData.expect.receivingAddresses[0]);
                  expect(summary.spentAmount?.toString()).to.eq(transData.expect.spentAmounts[0].amount.toString());
                  expect(summary.receivedAmount?.toString()).to.eq(transData.expect.receivedAmounts[0].amount.toString());
                  expect(summary.paymentReference).to.eq(transData.expect.stdPaymentReference);
                  expect(summary.oneToOne).to.eq(true);
                  expect(summary.isFull).to.eq(true);
               } else {
                  expect(summary.isNativePayment).to.eq(transData.expect.isNativePayment);
               }
            }
         });
      });
   });
}

describe("Misc tests", function () {
   it("Should get invalid method call ", async function () {
      let MccClient = new MCC.ALGO(algoCreateConfig);
      await expect(MccClient.getTransaction("")).to.be.rejectedWith("InvalidMethodCall");
   });

   it("Should not list transactions ", async function () {
      let MccClient = new MCC.ALGO(algoCreateConfig);
      let res = await MccClient.listTransactions();
      expect(res).to.be.null;
   });

   // Next is not testing the right thing NOT ACLOSE
   it("Should get receiving address with aclose ", async function () {
      let MccClient = new MCC.ALGO(algoCreateConfig);
      let res = await MccClient.getBlock(23208015);
      let txId = "W4VEWI5ZRJTNRGS4ITNLPFLCIC3HOKB3JJ7ZXB5I24X7DEBTBZNQ";
      let tr = res.transactions[0];
      for (let tra of res.transactions) {
         if (tra.txid === txId) {
            tr = tra;
         }
      }

      tr.data.aclose = tr.data.arcv;

      expect(tr.receivingAddresses.length).to.eq(2);
   });

   it("Should get receiving address  and should not get spent amounts with close ", async function () {
      let MccClient = new MCC.ALGO(algoCreateConfig);
      let res = await MccClient.getBlock();
      let tr = res.transactions[0];
      // TODO the assumption that every block has a pay transaction may be a bit much
      for (let tra of res.transactions) {
         if (tra.type === "pay") {
            tr = tra;
         }
      }
      tr.data.close = tr.data.rcv;
      expect(tr.receivingAddresses.length).to.eq(2);
      expect(() => tr.spentAmounts).to.throw("InvalidResponse");
   });

   it("Should get receiving fee (no fee) ", async function () {
      let MccClient = new MCC.ALGO(algoCreateConfig);
      let res = await MccClient.getBlock();
      let tr = res.transactions[0];
      delete tr.data.fee;
      expect(tr.fee.toNumber()).to.eq(0);
   });

   it("Should not list transactions ", async function () {
      let MccClient = new MCC.ALGO(algoCreateConfig);
      await expect(MccClient.getIndexerBlock()).to.be.rejectedWith("InvalidMethodCall");
   });
});

const axferTestdata = {
   blockRound: 23208001,
   txId: "PYKAYDUNPKY6LOLQG44Q43EKJBXIVB4VT4BKCQPD3POWJFC5Q77A",
   txtype: "axfer",
   aamt: 906543471648,
   sender: "5MJUVKSJO4FH6V6F2IHWXQZD2MCF4GTIMIMZDIYIZM7HIAAHMJSTBVT2UM",
};

describe("Axfer assets tests", function () {
   let MccClient: MCC.ALGO;
   let block: AlgoBlock;
   let transaction: AlgoTransaction;
   // let transaction2: AlgoTransaction;
   MccClient = new MCC.ALGO(algoCreateConfig);

   before(async function () {
      let txId = axferTestdata.txId;

      block = await MccClient.getBlock(axferTestdata.blockRound);
      for (let txOb of block.transactions) {
         if (txOb.txid === txId) {
            transaction = txOb;
         }
      }
   });

   it("Should find transaction in block ", function () {
      expect(transaction).to.not.eq(undefined);
   });

   it("Should throw if not full transaction", async function () {
      await expect(() => transaction.assetSpentAmounts).to.throw("InvalidResponse");
      await expect(() => transaction.assetReceivedAmounts).to.throw("InvalidResponse");
      // await transaction.makeFull(MccClient);
      // console.log(transaction);
      // console.log(transaction.assetSpentAmounts);
   });

   it("Should get full transaction", async function () {
      await transaction.makeFull(MccClient);
      expect(transaction.additionalData).to.not.be.undefined;
   });

   it("Should get assetSpentAmounts/assetReceivedAmounts/assetSourceAddresses", async function () {
      await transaction.makeFull(MccClient);
      // console.log(transaction.assetSourceAddresses);
      expect(transaction.assetSpentAmounts).to.not.be.undefined;
      expect(transaction.assetReceivedAmounts).to.not.be.undefined;
      expect(transaction.assetSourceAddresses[0]).to.be.equal(axferTestdata.sender);
   });
});

const payCloseTestdata = {
   blockRound: 23208015,
   txId: "W4VEWI5ZRJTNRGS4ITNLPFLCIC3HOKB3JJ7ZXB5I24X7DEBTBZNQ",
   txtype: "pay",
   rcvAdd: "KRZYFYXTQ3YK5ADN4VFYFHGRLA6RGUIEO3D54LZC3MV5LKI66P3LDLPVTI",
};
describe("Pay_close tests", function () {
   let MccClient: MCC.ALGO;
   let block: AlgoBlock;
   let transaction: AlgoTransaction;
   // let transaction2: AlgoTransaction;
   MccClient = new MCC.ALGO(algoCreateConfig);

   before(async function () {
      let txId = payCloseTestdata.txId;

      block = await MccClient.getBlock(payCloseTestdata.blockRound);
      for (let txOb of block.transactions) {
         if (txOb.txid === txId) {
            transaction = txOb;
         }
      }
   });

   it("Should find transaction in block ", function () {
      expect(transaction).to.not.eq(undefined);
   });

   it("Should find the type", function () {
      expect(transaction.type).to.eq("pay_close");
   });

   it("Should get recivingAddresses", function () {
      expect(transaction.receivingAddresses[0]).to.be.equal(payCloseTestdata.rcvAdd);
   });
   it("Should get not assetRecivingAddresses", function () {
      expect(transaction.assetReceivingAddresses[0]).to.be.undefined;
   });

   it("Should get not recivedAmounts", function () {
      expect(() => transaction.receivedAmounts).to.throw("InvalidResponse");
   });

   it("Should get not assetRecivedAmounts", function () {
      expect(transaction.assetReceivedAmounts[0]).to.be.undefined;
   });
   it("Should get not assetSourceAddresses", function () {
      expect(transaction.assetSourceAddresses[0]).to.be.undefined;
   });
   it("Should get not assetSpentAmounts", function () {
      expect(transaction.assetSpentAmounts[0]).to.be.undefined;
   });
});

const assetCloseTestdata = {
   blockRound: 23208015,
   txId: "TSLAKUC3THKQDGRAQVEF2I3WVMWLBYBSK2HAO5GPCMY27KRDUWNA",
   txtype: "axfer_close",
   rcvAdd: "KRZYFYXTQ3YK5ADN4VFYFHGRLA6RGUIEO3D54LZC3MV5LKI66P3LDLPVTI",
};
describe("Axfer_close tests", function () {
   let MccClient: MCC.ALGO;
   let block: AlgoBlock;
   let transaction: AlgoTransaction;
   // let transaction2: AlgoTransaction;
   MccClient = new MCC.ALGO(algoCreateConfig);

   before(async function () {
      let txId = assetCloseTestdata.txId;

      block = await MccClient.getBlock(assetCloseTestdata.blockRound);
      for (let txOb of block.transactions) {
         if (txOb.txid === txId) {
            transaction = txOb;
         }
      }
   });

   it("Should find transaction in block ", function () {
      expect(transaction).to.not.eq(undefined);
   });

   it("Should find the type", function () {
      expect(transaction.type).to.eq(assetCloseTestdata.txtype);
   });

   it("Should get  empty recivingAddresses", function () {
      expect(transaction.receivingAddresses.length).to.be.equal(0);
   });
   it("Should get  empty receivedAmounts", function () {
      expect(transaction.receivedAmounts.length).to.be.equal(0);
   });

   it("Should get  spentAmounts = fee", function () {
      expect(transaction.spentAmounts[0].amount.toNumber()).to.be.equal(transaction.fee.toNumber());
   });

   it("Should get assetRecivingAddresses", function () {
      expect(transaction.assetReceivingAddresses.length).to.be.equal(2);
      expect(transaction.assetReceivingAddresses[0]).to.be.equal(assetCloseTestdata.rcvAdd);
   });

   it("Should not get assetSpentAmounts", function () {
      expect(() => transaction.assetSpentAmounts).to.throw("InvalidResponse");
   });

   it("Should not get assetReceivedAmounts", function () {
      expect(() => transaction.assetReceivedAmounts).to.throw("InvalidResponse");
   });

   // it("Should get not assetRecivedAmounts", function () {
   //    expect(transaction.assetReceivedAmounts[0]).to.be.undefined;
   // });
   // it("Should get not assetSourceAddresses", function () {
   //    expect(transaction.assetSourceAddresses[0]).to.be.undefined;
   // });

   it("Should get payment summery", async function () {
      expect((await transaction.paymentSummary()).isNativePayment).to.be.eq(false);
   });
});
