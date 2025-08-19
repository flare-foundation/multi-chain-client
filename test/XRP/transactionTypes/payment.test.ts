// yarn test test/XRP/transactionTypes/payment.test.ts

import { assert, expect } from "chai";
import {
    AddressAmount,
    BalanceDecreasingSummaryStatus,
    MCC,
    PaymentSummaryStatus,
    TransactionSuccessStatus,
    XrpTransaction,
    standardAddressHash,
} from "../../../src";
import { AddressAmountEqual, getTestFile } from "../../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://xrplcluster.com",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe(`Payment transaction type (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("Payment Transaction Token", function () {
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction(
                "7BF105CFE4EFE78ADB63FE4E03A851440551FE189FD4B51CAAD9279C9F534F0E"
            );
        });

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: BigInt("10") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            expect(transaction.receivedAmounts).to.deep.equal([]);
        });

        it("should get intendant spent amount", function () {
            const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: BigInt("10") }];
            const intSpnAmt = transaction.intendedSpentAmounts;
            assert(AddressAmountEqual(intSpnAmt, expected));
        });

        it("should get intendant received amount", function () {
            const expected: AddressAmount[] = [];
            const intRecAmt = transaction.intendedReceivedAmounts;
            assert(AddressAmountEqual(intRecAmt, expected));
        });

        it("should get payment summary", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0n, outUtxo: 0n });
            expect(summary.status).to.eq(PaymentSummaryStatus.NotNativePayment);
        });

        it("should get balanceDecreasingSummary #1", function () {
            const summary = transaction.balanceDecreasingSummary(
                standardAddressHash("rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn")
            );
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("10");
        });

        it("should not  get balanceDecreasingSummary #2", function () {
            const summary = transaction.balanceDecreasingSummary(
                standardAddressHash("rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jrn")
            );
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.NoSourceAddress);
        });

        it("should not get balanceDecreasingSummary #3", function () {
            const summary = transaction.balanceDecreasingSummary("12");
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.NotValidSourceAddressFormat);
        });
        // // Token transfers
        // it.skip("should correctly parse assetSourceAddresses", async function () {
        //    expect(transaction.sourceAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
        // });

        // it.skip("should correctly parse assetReceivingAddresses", async function () {
        //    expect(transaction.receivingAddresses).to.deep.equal(["ra5nK24KXen9AHvsdFTKHSANinZseWnPcX"]);
        // });

        // it.skip("should correctly parse assetSpentAmounts", async function () {
        //    expect(transaction.assetSpentAmounts).to.deep.equal([{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: BigInt("1") }]);
        // });

        // it.skip("should correctly parse assetReceivedAmounts", async function () {
        //    expect(transaction.assetReceivedAmounts).to.deep.equal([{ address: "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX", amount: BigInt("1") }]);
        // });
    });

    describe("Payment Founding address example", function () {
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction(
                "0E8C600BB375A62708E662F6B7D1F096CA364793F655A8DBB358F8D723A59AB7"
            );
            //  console.dir(transaction, { depth: null });
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal(["rDM9x1ehphbwXX8UhvF2j8tyuJY2VVnm5"]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal(["r14f8Luu4dYKzNEwFYV2KfA74YZcWVS5F"]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: "rDM9x1ehphbwXX8UhvF2j8tyuJY2VVnm5", amount: BigInt("1400000010") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected = [{ address: "r14f8Luu4dYKzNEwFYV2KfA74YZcWVS5F", amount: BigInt("1400000000") }];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get intendant spent amount", function () {
            const expected = [{ address: "rDM9x1ehphbwXX8UhvF2j8tyuJY2VVnm5", amount: BigInt("1400000010") }];
            const intSpnAmt = transaction.intendedSpentAmounts;
            assert(AddressAmountEqual(intSpnAmt, expected));
        });

        it("should get intendant received amount", function () {
            const expected = [{ address: "r14f8Luu4dYKzNEwFYV2KfA74YZcWVS5F", amount: BigInt("1400000000") }];
            const intRecAmt = transaction.intendedReceivedAmounts;
            assert(AddressAmountEqual(intRecAmt, expected));
        });

        it("should get payment summary", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0n, outUtxo: 0n });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("1400000010");
            expect(summary.response!.sourceAddressHash).to.eq(standardAddressHash("rDM9x1ehphbwXX8UhvF2j8tyuJY2VVnm5"));

            expect(summary.response!.receivedAmount.toString()).to.eq("1400000000");
            expect(summary.response!.receivingAddressHash).to.eq(
                standardAddressHash("r14f8Luu4dYKzNEwFYV2KfA74YZcWVS5F")
            );
            expect(summary.response!.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(
                standardAddressHash("rDM9x1ehphbwXX8UhvF2j8tyuJY2VVnm5")
            );
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("1400000010");
        });
    });

    describe("Payment Transaction Native", function () {
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction(
                "160426BB861B2E1AD7A4214EE12B41A3C9C4EEBCC15B4D8A5C41E9405E288CDB"
            );
        });

        it("should correctly parse sourceAddresses", function () {
            expect(transaction.sourceAddresses).to.deep.equal(["rpAepkGqJnQSNTxozKSu9KPrxHVgyLpL8p"]);
        });

        it("should correctly parse receivingAddresses", function () {
            expect(transaction.receivingAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
        });

        it("should correctly parse spentAmounts", function () {
            const expected = [{ address: "rpAepkGqJnQSNTxozKSu9KPrxHVgyLpL8p", amount: BigInt("39") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", function () {
            const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: BigInt("27") }];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });

        it("should get intendant spent amount", function () {
            const expected = [{ address: "rpAepkGqJnQSNTxozKSu9KPrxHVgyLpL8p", amount: BigInt("39") }];
            const intSpnAmt = transaction.intendedSpentAmounts;
            assert(AddressAmountEqual(intSpnAmt, expected));
        });

        it("should get intendant received amount", function () {
            const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: BigInt("27") }];
            const intRecAmt = transaction.intendedReceivedAmounts;
            assert(AddressAmountEqual(intRecAmt, expected));
        });

        it("should get payment summary", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0n, outUtxo: 0n });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("39");
            expect(summary.response!.sourceAddressHash).to.eq(
                standardAddressHash("rpAepkGqJnQSNTxozKSu9KPrxHVgyLpL8p")
            );

            expect(summary.response!.receivedAmount.toString()).to.eq("27");
            expect(summary.response!.receivingAddressHash).to.eq(
                standardAddressHash("rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn")
            );
            expect(summary.response!.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(
                standardAddressHash("rpAepkGqJnQSNTxozKSu9KPrxHVgyLpL8p")
            );
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("39");
            expect(summary.response!.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
        });

        // // Token transfers
        // it.skip("should correctly parse assetSourceAddresses", async function () {
        //    expect(transaction.sourceAddresses).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetReceivingAddresses", async function () {
        //    expect(transaction.receivingAddresses).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetSpentAmounts", async function () {
        //    expect(transaction.assetSpentAmounts).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetReceivedAmounts", async function () {
        //    expect(transaction.assetReceivedAmounts).to.deep.equal([]);
        // });
    });

    //TODO: find a failed transaction, where it is receiver's fault
    describe("Payment failed token", function () {
        let transaction: XrpTransaction;
        const txId = "ABCB6A1F027446C2A0711055978455FE272D69D945A3244D2DC76D16346F60BF";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("Should get type", function () {
            const type = transaction.type;
            expect(type).to.eq("Payment");
        });

        it("Should get successStatus", function () {
            const status = transaction.successStatus;
            expect(status).to.eq(1);
        });

        it("Should get reference", function () {
            const reference = transaction.reference;
            expect(reference).to.deep.eq([]);
        });

        it("Should get currencyName", function () {
            const currencyName = transaction.currencyName;
            expect(currencyName).to.eq("XCC");
        });

        it("Should get fee", function () {
            const fee = transaction.fee;
            expect(fee.toString()).to.eq("10");
        });
        it("Should get sourceAddress", function () {
            const sourceAddress = transaction.sourceAddresses[0];
            expect(sourceAddress).to.eq("r9ZrUqa98hycMA4QCuz2twW5x7JhiHYhxB");
        });
        it("Should get spentAmounts", function () {
            const spentAmounts = transaction.spentAmounts;
            assert(
                AddressAmountEqual(spentAmounts, [
                    { address: "r9ZrUqa98hycMA4QCuz2twW5x7JhiHYhxB", amount: BigInt(10) },
                ])
            );
        });

        it("Should get receivingAddress", function () {
            const receivingAddress = transaction.receivingAddresses[0];
            assert(!receivingAddress, "No xrp was transferred");
        });

        it("Should get receivedAmounts", function () {
            const receivedAmounts = transaction.receivedAmounts[0];
            assert(!receivedAmounts, "No xrp was transferred");
        });

        it("should get intendant spent amount", function () {
            const expected = [{ address: "r9ZrUqa98hycMA4QCuz2twW5x7JhiHYhxB", amount: BigInt(10) }];
            const intSpnAmt = transaction.intendedSpentAmounts;
            assert(AddressAmountEqual(intSpnAmt, expected));
        });

        it("should get intendant received amount", function () {
            const expected: AddressAmount[] = [];
            const intRecAmt = transaction.intendedReceivedAmounts;
            assert(AddressAmountEqual(intRecAmt, expected));
        });

        it("should get payment summary", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0n, outUtxo: 0n });
            expect(summary.status).to.eq(PaymentSummaryStatus.NotNativePayment);
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(
                standardAddressHash("r9ZrUqa98hycMA4QCuz2twW5x7JhiHYhxB")
            );
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("10");
            expect(summary.response!.transactionStatus).to.eq(TransactionSuccessStatus.SENDER_FAILURE);
        });
    });

    describe("Payment failed native", function () {
        let transaction: XrpTransaction;
        const txId = "0CA39DB06360BFAA73AF46C363EFB7770A1A5B5E9CDDE94BFB5F2C7F014F26DC";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("Should get type", function () {
            const type = transaction.type;
            expect(type).to.eq("Payment");
        });

        it("Should get successStatus", function () {
            const status = transaction.successStatus;
            expect(status).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
        });

        it("Should get reference", function () {
            const reference = transaction.reference;
            expect(reference).to.deep.eq([]);
        });

        // it("Should get currencyName", function () {});

        it("Should get fee", function () {
            const fee = transaction.fee;
            expect(fee.toString()).to.eq("10");
        });
        it("Should get sourceAddress", function () {
            const sourceAddress = transaction.sourceAddresses[0];
            expect(sourceAddress).to.eq("rJF9FcJbVuq79FSjqHuM9rBSxXSQFtRLu2");
        });
        it("Should get spentAmounts", function () {
            const spentAmounts = transaction.spentAmounts;
            assert(
                AddressAmountEqual(spentAmounts, [
                    { address: "rJF9FcJbVuq79FSjqHuM9rBSxXSQFtRLu2", amount: BigInt(10) },
                ])
            );
        });

        it("Should get receivingAddress", function () {
            const receivingAddress = transaction.receivingAddresses[0];
            assert(!receivingAddress, "No xrp was transferred");
        });

        it("Should get receivedAmounts", function () {
            const receivedAmounts = transaction.receivedAmounts[0];
            assert(!receivedAmounts, "No xrp was transferred");
        });

        it("should get intendant spent amount", function () {
            const expected = [{ address: "rJF9FcJbVuq79FSjqHuM9rBSxXSQFtRLu2", amount: BigInt(22) }];
            const intSpnAmt = transaction.intendedSpentAmounts;
            assert(AddressAmountEqual(intSpnAmt, expected));
        });

        it("should get intendant received amount", function () {
            const expected = [{ address: "rLCq1KvoCYeMj4H8hsRFrfPYHCRLLYDHdU", amount: BigInt(12) }];
            const intRecAmt = transaction.intendedReceivedAmounts;
            assert(AddressAmountEqual(intRecAmt, expected));
        });

        it("should get payment summary", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0n, outUtxo: 0n });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            assert(summary.response);
            expect(summary.response.transactionStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
            // expect(summary.response!.spentAmount.toString()).to.eq("10");
            // expect(summary.response!.receivedAmount.toString()).to.eq("0");
            // expect(summary.response!.receivedAmount.toString()).to.eq("0");
            // expect(summary.response!.transactionStatus).to.eq(TransactionSuccessStatus.SENDER_FAILURE);
        });

        it("should get balanceDecreasingSummary", function () {
            const summary = transaction.balanceDecreasingSummary(
                standardAddressHash("rJF9FcJbVuq79FSjqHuM9rBSxXSQFtRLu2")
            );
            expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
            expect(summary.response!.spentAmount.toString()).to.eq("10");
            expect(summary.response!.transactionStatus).to.eq(TransactionSuccessStatus.RECEIVER_FAILURE);
        });
    });
});
