import { expect } from "chai";
import { AlgoTransaction, MCC } from "../../src";

// const algoCreateConfig = {
//    algod: {
//       url: process.env.ALGO_ALGOD_URL_TEST || "",
//       token: process.env.ALGO_ALGOD_TOKEN_TEST || "",
//    },
//    indexer: {
//       url: process.env.ALGO_INDEXER_URL_TEST || "",
//       token: process.env.ALGO_INDEXER_TOKEN_TEST || "",
//    },
// };

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
describe("Algo Transaction test ", function () {
   let MccClient: MCC.ALGO;

   // Testnet
//    const TransactionsToTest = [
//       { description: "Token Transfer transaction", txid: "DRR2GNWOBELIPHUO5PQA4PQLSFWOOIOLEH5B53RK3W2GLCOBOQTQ" },
//       { description: "Transaction with one reference", txid: "HG5KBZ3JYRUZ7XVTNU3BCLCNICDRS7RMJ4FJVTMKOFVXOWAVO25Q" },
//       { description: "Something odd ", txid: "BBKVLTZNWRRZ2JZIOTPYXDR7BMQ25DEC2HGMGZ5AWMOKYWCUNE4Q"},
//   ];

   // Mainnet
   const TransactionsToTest = [
    { description: "my tx note as hex ", txid: "SKI4Z4WJZ7PJKLDL6CDXSNP7JWATKDVOXZVXUT7C2MWNGUA33DSQ" },
    { description: "my tx note as text", txid: "IIFP4F6M2SHVOH6EM2ACCHEJXWB7CW5BPUSKRQQSSTBDREKDRGRQ" },
   ];

   

   before(async function () {
      MccClient = new MCC.ALGO(algoCreateConfig);
      console.log(MccClient.chainType);
   });

   describe("Transaction does not exist ", function () {
      let transaction: AlgoTransaction;
      const txid = "HG5KBZ3JYRUZ7XVTNU3BCLCNICDRS7RMJ4FJVTMKOFVXOWAVO25V";

      it("Should get transaction does not exist ", async function () {
         let transaction = await MccClient.getTransaction(txid);
         expect(transaction).to.be.eq(null);
      });
   });

   for (let transData of TransactionsToTest) {
      describe(transData.description, function () {
         let transaction: AlgoTransaction;
         before(async function () {
            let transactionb = await MccClient.getTransaction(transData.txid);
            if (transactionb !== null) {
               transaction = transactionb;
            }
         });

         it("Should get transaction txid ", async function () {
            console.log(transaction.txid);
         });

         it("Should get transaction standardized txid ", async function () {
            console.log(transaction.stdTxid);
         });

         it("Should get transaction hash ", async function () {
            console.log(transaction.hash);
         });

         it("Should get transaction standardized reference ", async function () {
            console.log(transaction.stdPaymentReference);
         });

         it("Should get transaction reference array ", async function () {
            console.log(transaction.reference);
         });

         it("Should get transaction timestamp ", async function () {
            console.log(transaction.unixTimestamp);
         });

         it("Should get source address ", async function () {
            console.log(transaction.sourceAddresses);
         });

         it("Should get receiving address ", async function () {
            console.log(transaction.receivingAddresses);
         });

         it("Should get fee ", async function () {
            console.log(transaction.fee);
         });

         it("Should received amount ", async function () {
            console.log(transaction.receivedAmounts);
         });

         it("Should spend amount ", async function () {
            console.log(transaction.spentAmounts);
         });

         it("Should get type ", async function () {
            console.log(transaction.type);
         });

         it("Should get elementary unit ", async function () {
            console.log(transaction.elementaryUnits);
         });

         it("Should get success status ", async function () {
            console.log(transaction.successStatus);
         });

         it("Should get currency name ", async function () {
            console.log(transaction.currencyName);
         });

         it("Should check if native payment ", async function () {
            console.log(transaction.isNativePayment);
         });

         it("Should get transaction data ", async function () {
            console.log(transaction.data);
         });
      });
   }
});
