import { MCC, XrpTransaction } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
};

describe("Transaction Xrp tests ", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   describe("Transaction with one reference ", function () {
      let transaction: XrpTransaction;
      before(async function () {
         const txid = "C32ACF8CCF4F48B7AE097873AA2B7672DC66E05D4F1B3133DA90D1F476B1EAC6";
         let transactionb = await MccClient.getTransaction(txid);
         if (transactionb !== null) {
            transaction = transactionb;
         }
         // console.log(transaction);
      });

      it("Should get transaction hash ", async function () {
         console.log(transaction.hash);
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

      it("Should get payment summary ", async function () {
         const summary = await transaction.paymentSummary(MccClient);
         console.log(summary);
         if (summary.tokenElementaryUnits) console.log("tokenElementaryUnits: ", summary.tokenElementaryUnits.toString(10));
         if (summary.receivedTokenAmount) console.log("receivedTokenAmount: ", summary.receivedTokenAmount.toString(10));
         if (summary.spentAmount) console.log("spentAmount: ", summary.spentAmount.toString(10));
         if (summary.receivedAmount) console.log("receivedAmount: ", summary.receivedAmount.toString(10));
      });

      it.skip("Should get transaction data ", async function () {
         console.log(transaction.data);
      });
   });

   describe("Transaction with one reference ", function () {
      let transaction: XrpTransaction;
      before(async function () {
         const txid = "AB790D026B7C2E42113A1834A032CED756090D0FCE7EA995E0ACDE9660C88836";
         let transactionb = await MccClient.getTransaction(txid);
         if (transactionb !== null) {
            transaction = transactionb;
         }
         // console.log(transaction);
      });

      it("Should get transaction hash ", async function () {
         console.log(transaction.hash);
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

      it("Should get payment summary ", async function () {
         const summary = await transaction.paymentSummary(MccClient);
         console.log(summary);
         if (summary.tokenElementaryUnits) console.log("tokenElementaryUnits: ", summary.tokenElementaryUnits.toString(10));
         if (summary.receivedTokenAmount) console.log("receivedTokenAmount: ", summary.receivedTokenAmount.toString(10));
         if (summary.spentAmount) console.log("spentAmount: ", summary.spentAmount.toString(10));
         if (summary.receivedAmount) console.log("receivedAmount: ", summary.receivedAmount.toString(10));
      });

      it.skip("Should get transaction data ", async function () {
         console.log(transaction.data);
      });
   });

   describe("Transaction with one reference ", function () {
      let transaction: XrpTransaction;
      before(async function () {
         const txid = "75C7402BB60B574F7876627307EDACAA0A6830EB01692F150555999BDDBB4650";
         let transactionb = await MccClient.getTransaction(txid);
         if (transactionb !== null) {
            transaction = transactionb;
         }
         // console.log(transaction);
      });

      it("Should get transaction hash ", async function () {
         console.log(transaction.hash);
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

      it("Should get payment summary ", async function () {
         const summary = await transaction.paymentSummary(MccClient);
         console.log(summary);
         if (summary.tokenElementaryUnits) console.log("tokenElementaryUnits: ", summary.tokenElementaryUnits.toString(10));
         if (summary.receivedTokenAmount) console.log("receivedTokenAmount: ", summary.receivedTokenAmount.toString(10));
         if (summary.spentAmount) console.log("spentAmount: ", summary.spentAmount.toString(10));
         if (summary.receivedAmount) console.log("receivedAmount: ", summary.receivedAmount.toString(10));
      });

      it("Should get transaction data ", async function () {
         console.log(transaction.data);
      });
   });

   describe("Transaction with no reference token transfer ", function () {
      let transaction: XrpTransaction;
      before(async function () {
         const txid = "84464F5001B9E7FD79C448B9C5F01085ACE56E94A1F6E2A737FDE9A993086F16";
         let transactionb = await MccClient.getTransaction(txid);
         if (transactionb !== null) {
            transaction = transactionb;
         }
         // console.log(transaction);
      });

      it("Should get transaction hash ", async function () {
         console.log(transaction.hash);
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

      it("Should get payment summary ", async function () {
         const summary = await transaction.paymentSummary(MccClient);
         console.log(summary);
         if (summary.tokenElementaryUnits) console.log("tokenElementaryUnits: ", summary.tokenElementaryUnits.toString(10));
         if (summary.receivedTokenAmount) console.log("receivedTokenAmount: ", summary.receivedTokenAmount.toString(10));
         if (summary.spentAmount) console.log("spentAmount: ", summary.spentAmount.toString(10));
         if (summary.receivedAmount) console.log("receivedAmount: ", summary.receivedAmount.toString(10));
      });

      it("Should get transaction data ", async function () {
         console.log(transaction.data);
      });
   });
});
