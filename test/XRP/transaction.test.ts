import { expect } from "chai";
import { TransactionMetadata } from "xrpl";
import { MCC, traceManager, TransactionSuccessStatus, XrpTransaction } from "../../src";
import sinon from "sinon";
import { getTestFile } from "../testUtils";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe(`Transaction Xrp tests (${getTestFile(__filename)})`, function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   describe("Offer create transaction ", function () {
      let transaction: XrpTransaction;
      const txid = "C32ACF8CCF4F48B7AE097873AA2B7672DC66E05D4F1B3133DA90D1F476B1EAC6";
      before(async function () {
         transaction = await MccClient.getTransaction(txid);
      });

      it("Should find transaction ", function () {
         expect(transaction).to.not.eq(undefined);
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq(txid);
      });

      it("Should get standardized txid ", async function () {
         expect(transaction.stdTxid).to.eq(txid);
      });

      it("Should get transaction hash ", async function () {
         expect(transaction.hash).to.eq(txid);
      });

      it("Should get transaction reference array ", async function () {
         expect(transaction.reference.length).to.eq(1);
      });

      it("Should get standardized transaction reference ", async function () {
         expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
      });

      it("Should get transaction timestamp ", async function () {
         expect(transaction.unixTimestamp).to.eq(1646397932);
      });

      it("Should get source address ", async function () {
         expect(transaction.sourceAddresses.length).to.eq(1);
         expect(transaction.sourceAddresses[0]).to.eq("rETx8GBiH6fxhTcfHM9fGeyShqxozyD3xe");
      });

      it("Should get receiving address ", async function () {
         expect(transaction.receivingAddresses.length).to.eq(0);
      });

      it("Should get fee ", async function () {
         expect(transaction.fee.toNumber()).to.eq(20);
      });

      it("Should received amount ", async function () {
         expect(transaction.receivedAmounts.length).to.eq(0);
      });

      it("Should get type ", async function () {
         expect(transaction.type).to.eq("OfferCreate");
      });

      it("Should check if native payment ", async function () {
         expect(transaction.isNativePayment).to.eq(false);
      });

      it("Should get currency name ", async function () {
         expect(transaction.currencyName).to.eq("");
      });

      it("Should get elementary unit ", async function () {
         expect(transaction.elementaryUnits.toNumber()).to.eq(1000000);
      });

      it("Should get success status ", async function () {
         expect(transaction.successStatus).to.eq(0);
      });

      it("Should get payment summary ", async function () {
         const summary = await transaction.paymentSummary(MccClient);
         expect(summary).to.eql({ isNativePayment: false });
      });

      it("Should spend amount ", async function () {
         expect(transaction.spentAmounts.length).to.eq(1);
         expect(transaction.spentAmounts[0].address).to.eq("rETx8GBiH6fxhTcfHM9fGeyShqxozyD3xe");
         expect(transaction.spentAmounts[0].amount.toNumber()).to.eq(20);
      });
   });

   describe("Token Transfer transaction ", function () {
      let transaction: XrpTransaction;
      const txid = "AB790D026B7C2E42113A1834A032CED756090D0FCE7EA995E0ACDE9660C88836";
      before(async function () {
         transaction = await MccClient.getTransaction(txid);
      });

      it("Should find transaction ", function () {
         expect(transaction).to.not.eq(undefined);
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq(txid);
      });

      it("Should get standardized txid ", async function () {
         expect(transaction.stdTxid).to.eq(txid);
      });

      it("Should get transaction hash ", async function () {
         expect(transaction.hash).to.eq(txid);
      });

      it("Should get transaction reference array ", async function () {
         expect(transaction.reference.length).to.eq(1);
      });

      it("Should get standardized transaction reference ", async function () {
         expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
      });

      it("Should get transaction timestamp ", async function () {
         expect(transaction.unixTimestamp).to.eq(1646398292);
      });

      it("Should get source address ", async function () {
         expect(transaction.sourceAddresses.length).to.eq(1);
         expect(transaction.sourceAddresses[0]).to.eq("rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1");
      });

      it("Should get receiving address ", async function () {
         expect(transaction.receivingAddresses.length).to.eq(0);
      });

      it("Should get fee ", async function () {
         expect(transaction.fee.toNumber()).to.eq(20);
      });

      it("Should spend amount ", async function () {
         expect(transaction.spentAmounts.length).to.eq(1);
         expect(transaction.spentAmounts[0].address).to.eq("rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1");
         expect(transaction.spentAmounts[0].amount.toNumber()).to.eq(20);
      });

      it("Should received amount ", async function () {
         expect(transaction.receivedAmounts.length).to.eq(0);
      });

      it("Should get type ", async function () {
         expect(transaction.type).to.eq("Payment");
      });

      it("Should check if native payment ", async function () {
         expect(transaction.isNativePayment).to.eq(false);
      });

      it("Should get currency name ", async function () {
         expect(transaction.currencyName).to.eq("CX1");
      });

      it("Should get elementary unit ", async function () {
         expect(transaction.elementaryUnits.toNumber()).to.eq(1000000);
      });

      it("Should get success status ", async function () {
         expect(transaction.successStatus).to.eq(0);
      });

      it("Should get payment summary ", async function () {
         const summary = await transaction.paymentSummary(MccClient);
         expect(summary.isNativePayment).to.eq(false);
         expect(summary.sourceAddress).to.eq("rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1");
         expect(summary.receivingAddress).to.eq(undefined);
         expect(summary.spentAmount?.toNumber()).to.eq(20);
         expect(summary.receivedAmount?.toNumber()).to.eq(undefined);
         expect(summary.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         expect(summary.tokenElementaryUnits?.toNumber()).to.eq(1);
         expect(summary.receivedTokenAmount?.toNumber()).to.eq(10);
         expect(summary.oneToOne).to.eq(true);
         expect(summary.isFull).to.eq(true);
      });
   });

   describe("Transaction with native currency ", function () {
      let transaction: XrpTransaction;
      const txid = "75C7402BB60B574F7876627307EDACAA0A6830EB01692F150555999BDDBB4650";

      before(async function () {
         transaction = await MccClient.getTransaction(txid);
      });

      it("Should find transaction ", function () {
         expect(transaction).to.not.eq(undefined);
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq(txid);
      });

      it("Should get standardized txid ", async function () {
         expect(transaction.stdTxid).to.eq(txid);
      });

      it("Should get transaction hash ", async function () {
         expect(transaction.hash).to.eq(txid);
      });

      it("Should get transaction reference array ", async function () {
         expect(transaction.reference.length).to.eq(0);
      });

      it("Should get standardized transaction reference ", async function () {
         expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
      });

      it("Should get transaction timestamp ", async function () {
         expect(transaction.unixTimestamp).to.eq(1647510771);
      });

      it("Should get source address ", async function () {
         expect(transaction.sourceAddresses.length).to.eq(1);
         expect(transaction.sourceAddresses[0]).to.eq("r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy");
      });

      it("Should get receiving address ", async function () {
         expect(transaction.receivingAddresses.length).to.eq(1);
         expect(transaction.receivingAddresses[0]).to.eq("rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n");
      });

      it("Should get fee ", async function () {
         expect(transaction.fee.toNumber()).to.eq(45);
      });

      it("Should spend amount ", async function () {
         expect(transaction.spentAmounts.length).to.eq(1);
         expect(transaction.spentAmounts[0].address).to.eq("r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy");
         expect(transaction.spentAmounts[0].amount.toNumber()).to.eq(342390045);
      });

      it("Should received amount ", async function () {
         expect(transaction.receivedAmounts.length).to.eq(1);
         expect(transaction.receivedAmounts[0].address).to.eq("rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n");
         expect(transaction.receivedAmounts[0].amount.toNumber()).to.eq(342390000);
      });

      it("Should get type ", async function () {
         expect(transaction.type).to.eq("Payment");
      });

      it("Should check if native payment ", async function () {
         expect(transaction.isNativePayment).to.eq(true);
      });

      it("Should get currency name ", async function () {
         expect(transaction.currencyName).to.eq("XRP");
      });

      it("Should get elementary unit ", async function () {
         expect(transaction.elementaryUnits.toNumber()).to.eq(1000000);
      });

      it("Should get success status ", async function () {
         expect(transaction.successStatus).to.eq(0);
      });

      it("Should get payment summary ", async function () {
         const summary = await transaction.paymentSummary(MccClient);
         expect(summary.isNativePayment).to.eq(true);
         expect(summary.sourceAddress).to.eq("r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy");
         expect(summary.receivingAddress).to.eq("rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n");
         expect(summary.spentAmount?.toNumber()).to.eq(342390045);
         expect(summary.receivedAmount?.toNumber()).to.eq(342390000);
         expect(summary.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         expect(summary.tokenElementaryUnits?.toNumber()).to.eq(undefined);
         expect(summary.receivedTokenAmount?.toNumber()).to.eq(undefined);
         expect(summary.oneToOne).to.eq(true);
         expect(summary.isFull).to.eq(true);
      });
   });

   describe("Transaction with no reference token transfer ", function () {
      let transaction: XrpTransaction;
      const txid = "84464F5001B9E7FD79C448B9C5F01085ACE56E94A1F6E2A737FDE9A993086F16";

      before(async function () {
         transaction = await MccClient.getTransaction(txid);
      });

      it("Should find transaction ", function () {
         expect(transaction).to.not.eq(undefined);
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq(txid);
      });

      it("Should get standardized txid ", async function () {
         expect(transaction.stdTxid).to.eq(txid);
      });

      it("Should get transaction hash ", async function () {
         expect(transaction.hash).to.eq(txid);
      });

      it("Should get transaction reference array ", async function () {
         expect(transaction.reference.length).to.eq(0);
      });

      it("Should get standardized transaction reference ", async function () {
         expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
      });

      it("Should get transaction timestamp ", async function () {
         expect(transaction.unixTimestamp).to.eq(1646141781);
      });

      it("Should get source address ", async function () {
         expect(transaction.sourceAddresses.length).to.eq(1);
         expect(transaction.sourceAddresses[0]).to.eq("rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF");
      });

      it("Should get receiving address ", async function () {
         expect(transaction.receivingAddresses.length).to.eq(0);
      });

      it("Should get fee ", async function () {
         expect(transaction.fee.toNumber()).to.eq(10);
      });

      it("Should spend amount ", async function () {
         expect(transaction.spentAmounts.length).to.eq(1);
         expect(transaction.spentAmounts[0].address).to.eq("rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF");
         expect(transaction.spentAmounts[0].amount.toNumber()).to.eq(10);
      });

      it("Should received amount ", async function () {
         expect(transaction.receivedAmounts.length).to.eq(0);
      });

      it("Should get type ", async function () {
         expect(transaction.type).to.eq("Payment");
      });

      it("Should check if native payment ", async function () {
         expect(transaction.isNativePayment).to.eq(false);
      });

      it("Should get currency name ", async function () {
         expect(transaction.currencyName).to.eq("426C657373656400000000000000000000000000");
      });

      it("Should get elementary unit ", async function () {
         expect(transaction.elementaryUnits.toNumber()).to.eq(1000000);
      });

      it("Should get success status ", async function () {
         expect(transaction.successStatus).to.eq(0);
      });

      it("Should get payment summary ", async function () {
         const summary = await transaction.paymentSummary(MccClient);
         expect(summary.isNativePayment).to.eq(false);
         expect(summary.sourceAddress).to.eq("rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF");
         expect(summary.receivingAddress).to.eq(undefined);
         expect(summary.spentAmount?.toNumber()).to.eq(10);
         expect(summary.receivedAmount?.toNumber()).to.eq(undefined);
         expect(summary.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         expect(summary.tokenElementaryUnits?.toNumber()).to.eq(1);
         expect(summary.receivedTokenAmount?.toNumber()).to.eq(400000);
         expect(summary.oneToOne).to.eq(true);
         expect(summary.isFull).to.eq(true);
      });

      it("Should received amount 2 ", async function () {
         //  delete transaction.data.result.meta;
         expect(transaction.receivedAmounts.length).to.eq(0);
      });
   });

   describe("Account create tests", function () {
      let transaction1: XrpTransaction;
      let transaction2: XrpTransaction;
      const txid1 = "84464F5001B9E7FD79C448B9C5F01085ACE56E94A1F6E2A737FDE9A993086F16";
      const txid2 = "5439BB6872644CE74A09F4654CECFC5F443E9687AD5EF6D119E729898F41A8C5";
      before(async function () {
         transaction1 = await MccClient.getTransaction(txid1);
         transaction2 = await MccClient.getTransaction(txid2);
      });

      it("Should get account create ", async function () {
         transaction1.data.result.meta = "metaData";
         expect(transaction1.isAccountCreate).to.be.false;
         delete transaction1.data.result.meta;
         expect(transaction1.isAccountCreate).to.be.false;
      });

      //??What does this test??
      it.skip("Should get account create 2 ", async function () {
         const Meta = transaction2.data.result.meta as TransactionMetadata;
         for (const elem of Meta.AffectedNodes) {
            if ("CreatedNode" in elem) {
               elem.CreatedNode.NewFields.Account = "rDKsbvy9uaNpPtvVFraJyNGfjvTw8xivgK";
            }
         }
         expect(transaction2.isAccountCreate).to.be.false;
         for (const elem of Meta.AffectedNodes) {
            if ("CreatedNode" in elem) {
               delete elem.CreatedNode.NewFields.Account;
            }
         }
         expect(transaction2.isAccountCreate).to.be.false;
      });
   });

   describe("Transaction status and payment summary tests ", function () {
      let transaction1: XrpTransaction;
      let transaction2: XrpTransaction;
      let transaction3: XrpTransaction;
      const txid1 = "529C16436FFF89C1989A8D7B5182278BC6D8E5C93F4D0D052F9E39E27A222BB1";
      const txid2 = "F262BA3BD2575BCAC804E9320FEA90EFEA59BCA6723F431D9A4B80EBF9CC1058";
      const txid3 = "93D194C45CC60B2C17B8747BA50F1C028B637CFD9C5813918DBA73D2C21C2F27";
      before(async function () {
         //sinon.stub(console, "error");
         transaction1 = await MccClient.getTransaction(txid1);
         transaction2 = await MccClient.getTransaction(txid2);
         transaction3 = await MccClient.getTransaction(txid3);
      });

      // after(function () {
      //    sinon.restore();
      // });

      it(`Should get transaction status (${getTestFile(__filename)})`, async function () {
         expect(transaction1.successStatus).to.eq(TransactionSuccessStatus.SENDER_FAILURE);
         expect(transaction2.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
         expect(transaction3.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const metaData: TransactionMetadata = transaction3.data.result.meta || (transaction3.data.result as any).metaData;
         metaData.TransactionResult = "tecDST_TAG_NEEDED";
         expect(transaction3.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
         metaData.TransactionResult = "tecNO_DST";
         expect(transaction3.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
         metaData.TransactionResult = "tefALREADY";
         expect(transaction3.successStatus).to.eq(TransactionSuccessStatus.SENDER_FAILURE);
      });

      it("Should not get transaction status ", async function () {
         delete transaction2.data.result.meta;
         const fn = () => {
            return transaction2.successStatus;
         };
         expect(fn).to.throw("OutsideError");
         // await expect( fn ).to.be.rejectedWith("OutsideError");
      });

      it("Should get payment summary ", async function () {
         const summary1 = await transaction1.paymentSummary(MccClient);
         const summary2 = await transaction2.paymentSummary(MccClient);
         const summary3 = await transaction3.paymentSummary(MccClient);
         expect(summary1.isNativePayment).to.be.false;
         expect(summary2.isNativePayment).to.be.false;
         expect(summary3.isNativePayment).to.be.true;
         expect(summary3.receivedAmount?.toNumber()).to.eq(0);
      });
   });

   describe("Reference tests ", function () {
      let transaction: XrpTransaction;
      const txid = "C32ACF8CCF4F48B7AE097873AA2B7672DC66E05D4F1B3133DA90D1F476B1EAC6";
      before(async function () {
         transaction = await MccClient.getTransaction(txid);
      });
      it("References ", async () => {
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         transaction.data.result.Memos![0] = { Memo: { MemoType: "string" } };
         expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         transaction.data.result.Memos![0] = { Memo: { MemoData: txid } };
         expect(transaction.stdPaymentReference).to.eq("0x" + txid);
      });
   });

   describe("Transaction not found ", function () {
      it("Should not found", async () => {
         await expect(MccClient.getTransaction("93D194C45CC60B2C17B8747BA50F1C028B637CFD9C5813918DBA73D2C21C2F20")).to.be.rejected;
      });
   });
});
