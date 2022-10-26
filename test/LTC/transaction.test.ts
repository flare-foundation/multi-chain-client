import { BtcTransaction, MCC, toBN, TransactionSuccessStatus, UtxoMccCreate, UtxoTransaction } from "../../src";
import { transactionTestCases } from "../testUtils";

const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

const LtcMccConnection = {
   url: process.env.LTC_URL || "",
   username: process.env.LTC_USERNAME || "",
   password: process.env.LTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Transaction Ltc base test ", function () {
   let MccClient: MCC.LTC;

   before(async function () {
      MccClient = new MCC.LTC(LtcMccConnection);
   });

   describe("Transaction does not exist ", function () {
      const txid = "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d37786156ff";

      it("Should get transaction does not exist ", async function () {
         let transaction = MccClient.getTransaction(txid);
         await expect(transaction).to.be.rejectedWith("InvalidTransaction");
      });
   });

   describe("Transaction full ", function () {
      const txid = "40225226e4a3c7b00eebb8ec8fcb738c7069f557f3dd31370d51388ed65aa908";
      let transaction: BtcTransaction;

      before(async () => {
         let fullTrans = await MccClient.getTransaction(txid);
         if (fullTrans) {
            transaction = new BtcTransaction(fullTrans.data);
            await transaction.makeFullPayment(MccClient);
         }
      });

      it("Should find transaction in block ", function () {
         expect(transaction).to.not.eq(undefined);
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq(txid);
      });

      it("Should get standardized txid ", async function () {
         expect(transaction.stdTxid).to.eq(txid);
      });

      it("Should get transaction hash ", async function () {
         expect(transaction.hash).to.eq("5533d6dd7db5b2b0aeccb6f82d576308341ccbaaf78fbb968468cfb25d14ac02");
      });

      it("Should get transaction reference array ", async function () {
         const refarr: string[] = [];

         expect(transaction.reference.length).to.eq(refarr.length);
         const a = transaction.reference.sort();
         const b = refarr.sort();
         for (let i = 0; i < a.length; i++) {
            expect(a[i]).to.eq(b[i]);
         }
      });

      it("Should get standardized transaction reference ", async function () {
         expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
      });

      it("Should get transaction timestamp ", async function () {
         expect(transaction.unixTimestamp).to.eq(1650010974);
      });

      it("Should get source address ", async function () {
         const sourceAdd = ["MNxic71ZtazMySUJcTt9fShYGy9xgY69PE", "MMiDjEpzzvuuts1G3XrhM6UKcUyPcevcYB"];
         expect(transaction.sourceAddresses.length).to.eq(sourceAdd.length);
         const a = transaction.sourceAddresses.sort();
         const b = sourceAdd.sort();
         for (let i = 0; i < a.length; i++) {
            expect(a[i]).to.eq(b[i]);
         }
      });

      it("Should get receiving address ", async function () {
         const recAdd = ["ltc1q4tjs969dneux5cldan034vkfuteelt6l2h4w96", "ltc1q60a8aszz6aqlnac5n6zdmyefyhz7g5lul6h5jj"];
         expect(transaction.receivingAddresses.length).to.eq(recAdd.length);
         const a = transaction.receivingAddresses.sort();
         const b = recAdd.sort();
         for (let i = 0; i < a.length; i++) {
            expect(a[i]).to.eq(b[i]);
         }
      });

      it("Should get fee ", async function () {
         expect(transaction.fee.toString()).to.eq("25500");
      });

      it("Should spend amount ", async function () {
         const sourceAdd = [
            {
               address: "MNxic71ZtazMySUJcTt9fShYGy9xgY69PE",
               amount: toBN(6000),
            },
            {
               address: "MMiDjEpzzvuuts1G3XrhM6UKcUyPcevcYB",
               amount: toBN(14783439),
            },
         ];
         expect(transaction.spentAmounts.length).to.eq(sourceAdd.length);
         const a = transaction.spentAmounts.sort();
         const b = sourceAdd.sort();
         for (let i = 0; i < a.length; i++) {
            expect(a[i].address).to.eq(b[i].address);
            expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
         }
      });

      it("Should received amount ", async function () {
         const recAdd = [
            {
               address: "ltc1q4tjs969dneux5cldan034vkfuteelt6l2h4w96",
               amount: toBN(13788884),
            },
            {
               address: "ltc1q60a8aszz6aqlnac5n6zdmyefyhz7g5lul6h5jj",
               amount: toBN(975055),
            },
         ];
         expect(transaction.receivedAmounts.length).to.eq(recAdd.length);
         const a = transaction.receivedAmounts.sort();
         const b = recAdd.sort();
         for (let i = 0; i < a.length; i++) {
            expect(a[i].address).to.eq(b[i].address);
            expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
         }
      });

      it("Should get type ", async function () {
         expect(transaction.type).to.eq("full_payment");
      });
   });

   const TransactionsToTest: transactionTestCases[] = [
      {
         description: "Transaction with one reference",
         txid: "ac2b5558202927d78aa1f798c325180ccb8ba6b86eec0e3eac0177dbbb0a4eb8",
         expect: {
            txid: "ac2b5558202927d78aa1f798c325180ccb8ba6b86eec0e3eac0177dbbb0a4eb8",
            stdTxid: "ac2b5558202927d78aa1f798c325180ccb8ba6b86eec0e3eac0177dbbb0a4eb8",
            hash: "65b9933f105549cd4196369d30673b41034aa490fb9a915ef7ad3a9c68085339",
            reference: [],
            stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            unixTimestamp: 1655666878,
            sourceAddresses: [undefined],
            receivingAddresses: ["ltc1qetweexqmrszez23s8l6tlc0qvfgyneyg08q06m", "ML3CdKXQYiBBY8RWcXapuV2ZHpWbMo7DP1"],
            isFeeError: true,
            fee: "InvalidResponse", // number as a string
            spentAmounts: [
               {
                  address: undefined,
                  amount: toBN(0),
               },
            ],
            receivedAmounts: [
               {
                  address: "ltc1qetweexqmrszez23s8l6tlc0qvfgyneyg08q06m",
                  amount: toBN(545237020),
               },
               {
                  address: "ML3CdKXQYiBBY8RWcXapuV2ZHpWbMo7DP1",
                  amount: toBN(134761560),
               },
            ],
            type: "payment",
            isNativePayment: true,
            currencyName: "LTC",
            elementaryUnits: "100000000", // number as string
            successStatus: TransactionSuccessStatus.SUCCESS,
         },
      },
      {
         description: "Coinbase Transaction",
         txid: "458584edb759bc2b5842ba52467445c6c8e51dffcac5b5b9c59c8d88fd8447b6",
         expect: {
            txid: "458584edb759bc2b5842ba52467445c6c8e51dffcac5b5b9c59c8d88fd8447b6",
            stdTxid: "458584edb759bc2b5842ba52467445c6c8e51dffcac5b5b9c59c8d88fd8447b6",
            hash: "818e7777f12becb8a61d90b48dbc966aeb45a1bc1221d83db92767f772564043",
            reference: ["aa21a9edc37769589e812ce376b3f0189ca132bf1005b764416ad2d851a6efb2f8021aae"],
            stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            unixTimestamp: 1655666505,
            sourceAddresses: [undefined],
            receivingAddresses: ["LfmssDyX6iZvbVqHv6t9P6JWXia2JG7mdb", undefined],
            isFeeError: false,
            fee: "0", // number as a string
            spentAmounts: [
               {
                  address: undefined,
                  amount: toBN(0),
               },
            ],
            receivedAmounts: [
               {
                  address: "LfmssDyX6iZvbVqHv6t9P6JWXia2JG7mdb",
                  amount: toBN(1250889287),
               },
               {
                  address: undefined,
                  amount: toBN(0),
               },
            ],
            type: "coinbase",
            isNativePayment: true,
            currencyName: "LTC",
            elementaryUnits: "100000000", // number as string
            successStatus: TransactionSuccessStatus.SUCCESS,
         },
      },
   ];

   for (let transData of TransactionsToTest) {
      describe(transData.description, function () {
         let transaction: UtxoTransaction;
         before(async function () {
            transaction = await MccClient.getTransaction(transData.txid);
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
      });
   }
});

// TODO special transactions

// https://www.blockchain.com/btc/tx/56214420a7c4dcc4832944298d169a75e93acf9721f00656b2ee0e4d194f9970
// https://www.blockchain.com/btc/tx/055f9c6dc094cf21fa224e1eb4a54ee3cc44ae9daa8aa47f98df5c73c48997f9
