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

   const TransactionsToTest = [
    {
       description: "Token CORE",
       txid: "546433CEADAEEDB0DF3B67221F9FE6E2041482775C4BD67F34A41476F766B189",
    },
    {
       description: "Token LOVE",
       txid: "D0DBB956BD1DEFAB0CB46246F111B567BBD2D0CA090C26AFD57782C7C8C4BCE1",
    },
    {
       description: "Token CX1",
       txid: "69BE6AAD4A8D0991E72AA23ECB15C7847A0D3D44E3B23CE6BDA53701B7E0F9D2",
    },
    {
       description: "Token Blessed",
       txid: "84464F5001B9E7FD79C448B9C5F01085ACE56E94A1F6E2A737FDE9A993086F16",
    },
 ];

   for(let toTest of TransactionsToTest){
     describe(toTest.description, function () {
        let transaction: XrpTransaction;
        before(async function () {
           let transactionb = await MccClient.getTransaction(toTest.txid);
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
           console.log(transaction.fee.toString(10));
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
           console.log(transaction.elementaryUnits.toString(10));
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
  
        it("Should get success Status ", async function () {
           console.log(transaction.successStatus);
        });
  
        it("Should get payment summary ", async function () {
          const summary = await transaction.paymentSummary(MccClient)
          console.log(summary);
          if(summary.tokenElementaryUnits) console.log('tokenElementaryUnits: ',summary.tokenElementaryUnits.toString(10));
          if(summary.receivedTokenAmount) console.log('receivedTokenAmount: ',summary.receivedTokenAmount.toString(10));
          if(summary.spentAmount) console.log('spentAmount: ',summary.spentAmount.toString(10));
          if(summary.receivedAmount) console.log('receivedAmount: ',summary.receivedAmount.toString(10));
        });
  
        it("Should get transaction data ", async function () {
           console.log(transaction.data);
        });
     });
   }

});
