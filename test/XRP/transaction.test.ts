/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "chai";
import { assert } from "console";
import { TransactionMetadata } from "xrpl";
import { MCC, PaymentSummaryStatus, traceManager, TransactionSuccessStatus } from "../../src";
import { XrpTransaction } from "../../src/base-objects";
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

        it("Should get transaction hash ", function () {
            expect(transaction.hash).to.eq(txid);
        });

        it("Should get transaction reference array ", function () {
            expect(transaction.reference.length).to.eq(1);
        });

        it("Should get standardized transaction reference ", function () {
            expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
        });

        it("Should get transaction timestamp ", function () {
            expect(transaction.unixTimestamp).to.eq(1646397932);
        });

        it("Should get source address ", function () {
            expect(transaction.sourceAddresses.length).to.eq(1);
            expect(transaction.sourceAddresses[0]).to.eq("rETx8GBiH6fxhTcfHM9fGeyShqxozyD3xe");
        });

        it("Should get receiving address ", function () {
            expect(transaction.receivingAddresses.length).to.eq(0);
        });

        it("Should get fee ", function () {
            expect(transaction.fee).to.eq(BigInt(20));
        });

        it("Should received amount ", function () {
            expect(transaction.receivedAmounts.length).to.eq(0);
        });

        it("Should get type ", function () {
            expect(transaction.type).to.eq("OfferCreate");
        });

        it("Should check if native payment ", function () {
            expect(transaction.isNativePayment).to.eq(false);
        });

        it("Should get currency name ", function () {
            expect(transaction.currencyName).to.eq("");
        });

        it("Should get elementary unit ", function () {
            expect(transaction.elementaryUnits).to.eq(1000000);
        });

        it("Should get success status ", function () {
            expect(transaction.successStatus).to.eq(0);
        });

        it("Should get payment summary ", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0, outUtxo: 0 });
            expect(summary.status).to.eq(PaymentSummaryStatus.NotNativePayment);
        });

        it("Should get payment summary ", function () {
            const summary = transaction.paymentNonexistenceSummary();
            expect(summary.status).to.eq(PaymentSummaryStatus.NotNativePayment);
        });

        it("Should spend amount ", async function () {
            expect(transaction.spentAmounts.length).to.eq(1);
            expect(transaction.spentAmounts[0].address).to.eq("rETx8GBiH6fxhTcfHM9fGeyShqxozyD3xe");
            expect(transaction.spentAmounts[0].amount).to.eq(BigInt(20));
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
            expect(transaction.fee).to.eq(BigInt(20));
        });

        it("Should spend amount ", async function () {
            expect(transaction.spentAmounts.length).to.eq(1);
            expect(transaction.spentAmounts[0].address).to.eq("rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1");
            expect(transaction.spentAmounts[0].amount).to.eq(BigInt(20));
        });

        it("Should received amount ", async function () {
            expect(transaction.receivedAmounts.length).to.eq(0);
        });

        it("Should get type ", async function () {
            expect(transaction.type).to.eq("Payment");
        });

        it("Should check if native payment ", function () {
            expect(transaction.isNativePayment).to.eq(false);
        });

        it("Should get currency name ", function () {
            expect(transaction.currencyName).to.eq("CX1");
        });

        it("Should get elementary unit ", function () {
            expect(transaction.elementaryUnits).to.eq(1000000);
        });

        it("Should get success status ", function () {
            expect(transaction.successStatus).to.eq(0);
        });

        it("Should get payment summary ", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0, outUtxo: 0 });

            expect(summary.status).to.eq(PaymentSummaryStatus.NotNativePayment);
            assert(!summary.response);
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

        it("Should get transaction txid ", function () {
            expect(transaction.txid).to.eq(txid);
        });

        it("Should get standardized txid ", function () {
            expect(transaction.stdTxid).to.eq(txid);
        });

        it("Should get transaction hash ", function () {
            expect(transaction.hash).to.eq(txid);
        });

        it("Should get transaction reference array ", function () {
            expect(transaction.reference.length).to.eq(0);
        });

        it("Should get standardized transaction reference ", function () {
            expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
        });

        it("Should get transaction timestamp ", function () {
            expect(transaction.unixTimestamp).to.eq(1647510771);
        });

        it("Should get source address ", function () {
            expect(transaction.sourceAddresses.length).to.eq(1);
            expect(transaction.sourceAddresses[0]).to.eq("r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy");
        });

        it("Should get receiving address ", function () {
            expect(transaction.receivingAddresses.length).to.eq(1);
            expect(transaction.receivingAddresses[0]).to.eq("rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n");
        });

        it("Should get fee ", function () {
            expect(transaction.fee).to.eq(BigInt(45));
        });

        it("Should spend amount ", function () {
            expect(transaction.spentAmounts.length).to.eq(1);
            expect(transaction.spentAmounts[0].address).to.eq("r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy");
            expect(transaction.spentAmounts[0].amount).to.eq(BigInt(342390045));
        });

        it("Should received amount ", function () {
            expect(transaction.receivedAmounts.length).to.eq(1);
            expect(transaction.receivedAmounts[0].address).to.eq("rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n");
            expect(transaction.receivedAmounts[0].amount).to.eq(BigInt(342390000));
        });

        it("Should get type ", function () {
            expect(transaction.type).to.eq("Payment");
        });

        it("Should check if native payment ", function () {
            expect(transaction.isNativePayment).to.eq(true);
        });

        it("Should get currency name ", function () {
            expect(transaction.currencyName).to.eq("XRP");
        });

        it("Should get elementary unit ", function () {
            expect(transaction.elementaryUnits).to.eq(1000000);
        });

        it("Should get success status ", function () {
            expect(transaction.successStatus).to.eq(0);
        });

        it("Should get payment summary ", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0, outUtxo: 0 });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            expect(summary.response).to.exist;
            expect(summary.response!.sourceAddress).to.eq("r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy");
            expect(summary.response!.receivingAddress).to.eq("rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n");
            expect(summary.response!.spentAmount).to.eq(BigInt(342390045));
            expect(summary.response!.receivedAmount).to.eq(BigInt(342390000));
            expect(summary.response!.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
            expect(summary.response!.oneToOne).to.eq(true);
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

        it("Should get transaction txid ", function () {
            expect(transaction.txid).to.eq(txid);
        });

        it("Should get standardized txid ", function () {
            expect(transaction.stdTxid).to.eq(txid);
        });

        it("Should get transaction hash ", function () {
            expect(transaction.hash).to.eq(txid);
        });

        it("Should get transaction reference array ", function () {
            expect(transaction.reference.length).to.eq(0);
        });

        it("Should get standardized transaction reference ", function () {
            expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
        });

        it("Should get transaction timestamp ", function () {
            expect(transaction.unixTimestamp).to.eq(1646141781);
        });

        it("Should get source address ", function () {
            expect(transaction.sourceAddresses.length).to.eq(1);
            expect(transaction.sourceAddresses[0]).to.eq("rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF");
        });

        it("Should get receiving address ", function () {
            expect(transaction.receivingAddresses.length).to.eq(0);
        });

        it("Should get fee ", function () {
            expect(transaction.fee).to.eq(BigInt(10));
        });

        it("Should spend amount ", function () {
            expect(transaction.spentAmounts.length).to.eq(1);
            expect(transaction.spentAmounts[0].address).to.eq("rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF");
            expect(transaction.spentAmounts[0].amount).to.eq(BigInt(10));
        });

        it("Should received amount ", function () {
            expect(transaction.receivedAmounts.length).to.eq(0);
        });

        it("Should get type ", function () {
            expect(transaction.type).to.eq("Payment");
        });

        it("Should check if native payment ", function () {
            expect(transaction.isNativePayment).to.eq(false);
        });

        it("Should get currency name ", function () {
            expect(transaction.currencyName).to.eq("426C657373656400000000000000000000000000");
        });

        it("Should get elementary unit ", function () {
            expect(transaction.elementaryUnits).to.eq(1000000);
        });

        it("Should get success status ", function () {
            expect(transaction.successStatus).to.eq(0);
        });

        it("Should get payment summary ", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0, outUtxo: 0 });
            expect(summary.status).to.eq(PaymentSummaryStatus.NotNativePayment);
            assert(!summary.response);
        });

        // it("Should received amount 2 ", async function () {
        //    //  delete transaction.data.result.meta;
        //    expect(transaction.receivedAmounts.length).to.eq(0);
        // });
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

        it(`Should get transaction status (${getTestFile(__filename)})`, function () {
            expect(transaction1.successStatus).to.eq(TransactionSuccessStatus.SENDER_FAILURE);
            expect(transaction2.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
            expect(transaction3.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const metaData: TransactionMetadata = transaction3._data.result.meta || (transaction3._data.result as any).metaData;
            metaData.TransactionResult = "tecDST_TAG_NEEDED";
            expect(transaction3.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
            metaData.TransactionResult = "tecNO_DST";
            expect(transaction3.successStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
            metaData.TransactionResult = "tefALREADY";
            expect(transaction3.successStatus).to.eq(TransactionSuccessStatus.SENDER_FAILURE);
        });

        it.skip("Should not get transaction status ", function () {
            delete transaction2._data.result.meta;
            const fn = () => {
                return transaction2.successStatus;
            };
            expect(fn).to.throw("OutsideError");
        });

        it("Should get payment summary ", function () {
            const summary1 = transaction1.paymentSummary({ inUtxo: 0, outUtxo: 0 });
            const summary2 = transaction2.paymentSummary({ inUtxo: 0, outUtxo: 0 });
            const summary3 = transaction3.paymentSummary({ inUtxo: 0, outUtxo: 0 });
            expect(summary1.status).to.eq(PaymentSummaryStatus.NotNativePayment);
            expect(summary2.status).to.eq(PaymentSummaryStatus.NotNativePayment);
            // Transaction failed
            expect(summary3.status).to.eq(PaymentSummaryStatus.Success);
        });
    });

    describe("Reference tests ", function () {
        let transaction: XrpTransaction;
        const txid = "C32ACF8CCF4F48B7AE097873AA2B7672DC66E05D4F1B3133DA90D1F476B1EAC6";
        before(async function () {
            transaction = await MccClient.getTransaction(txid);
        });
        it("References ", () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            transaction._data.result.Memos![0] = { Memo: { MemoType: "string" } };
            expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            transaction._data.result.Memos![0] = { Memo: { MemoData: txid } };
            expect(transaction.stdPaymentReference).to.eq("0x" + txid);
        });
    });

    describe("Transaction not found ", function () {
        it("Should not found", async () => {
            await expect(MccClient.getTransaction("93D194C45CC60B2C17B8747BA50F1C028B637CFD9C5813918DBA73D2C21C2F20")).to.be.rejected;
        });
    });

    describe("Transactions sourceAddressesRoot (for testnet)", function () {
        const XRPTestnetMccConnection = {
            url: process.env.XRP_URL_TESTNET || "",
            username: process.env.XRP_USERNAME || "",
            password: process.env.XRP_PASSWORD || "",
            apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
        };
        let transaction: XrpTransaction;

        before(async function () {
            MccClient = new MCC.XRP(XRPTestnetMccConnection);
        });

        it("Should get same sourceAddressesRoot for xrp transaction as xrp indexer (test 1)", async function () {
            const tx_id = "1f572e746a69edde0c134824491567cc438cfb18a40aa0fd321e8143e70e9064";
            transaction = await MccClient.getTransaction(tx_id);
            expect(transaction.sourceAddressesRoot).to.eq("0x674fa9a46079864ce1744486bd1a7069794c8aade76b2d0424c4e716fba4f4ef");
        });
        it("Should get same sourceAddressesRoot for xrp transaction as xrp indexer (test 2)", async function () {
            const tx_id = "53040eb07116518d9866e3e6de504aa718f162b19a441e80c5045f68492b385b";
            transaction = await MccClient.getTransaction(tx_id);
            expect(transaction.sourceAddressesRoot).to.eq("0x7c7efcd5e28a5f7b9b5ade3dd16008deaae30e3588d854be8e0dff1cad3c5aa0");
        });
        it("Should get same sourceAddressesRoot for xrp transaction as xrp indexer (test 3)", async function () {
            const tx_id = "6a460d8c7919608c1d10883c6d9ad9d48c9e82b7058969039d94f42c7cfe49bf";
            transaction = await MccClient.getTransaction(tx_id);
            expect(transaction.sourceAddressesRoot).to.eq("0xcdbdabb5f4dbb023c42a28a0c63ec021e55727f4e9b67f94b8ce06de5c35083f");
        });

    });

});
