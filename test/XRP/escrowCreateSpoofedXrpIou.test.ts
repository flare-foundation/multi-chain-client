// pnpm test test/XRP/escrowCreateSpoofedXrpIou.test.ts

import { expect } from "chai";
import {
    AddressAmount,
    BalanceDecreasingSummaryStatus,
    MCC,
    PaymentNonexistenceSummaryStatus,
    PaymentSummaryStatus,
    TransactionSuccessStatus,
    XrpTransaction,
    ZERO_BYTES_32,
    standardAddressHash,
} from "../../src";
import { AddressAmountEqual, getTestFile, singleAddressAmountEqual } from "../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://xrplcluster.com",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
};

/**
 * `EscrowCreate` that escrows an IOU whose 40-hex non-standard currency code
 * `D0A552D0A0000000000000000000000000000000` decodes to the UTF-8 string
 * "ХRР" — Cyrillic Х (U+0425) and Р (U+0420) around an ASCII R, a homoglyph
 * of "XRP". Its memo reads
 * "27978.724561 XRP was credited to your account. Finalize escrow via xrp-escrow.com".
 *
 * The transaction is a valid, `tesSUCCESS` ledger entry, so `XrpTransaction`
 * must build from it without throwing while refusing to present it as an XRP
 * transfer: the only XRP that actually moved is the 10 drop fee, and the
 * spoofed IOU lives in a `RippleState` node that must not be counted as a
 * native amount.
 */
describe(`EscrowCreate with a spoofed "XRP" IOU (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;
    let transaction: XrpTransaction;

    const txId = "A65A5C376E7E919EE13912E83B76492DD3FDDA188462FB23D835FE7B3C2492D5";
    const sender = "rHXgaJLpjDe4jsAiF8atNrRfS6eYrjPYPB";
    const destination = "rs6q5K4RrVbrymieYjx9TFzTW24Rv9BekL";
    const fee = BigInt(10);
    // "27978.724561 XRP was credited to your account. Finalize escrow via xrp-escrow.com"
    const memoHex =
        "32373937382E373234353631205852502077617320637265646974656420746F20796F7572206163636F756E742E2046696E616C697A6520657363726F7720766961207872702D657363726F772E636F6D";

    before(async function () {
        MccClient = new MCC.XRP(XRPMccConnection);
        transaction = await MccClient.getTransaction(txId);
    });

    it("should construct the transaction object", function () {
        expect(transaction).to.not.eq(undefined);
        expect(transaction).to.be.instanceOf(XrpTransaction);
    });

    it("should correctly parse txid, stdTxid and hash", function () {
        expect(transaction.txid).to.eq(txId);
        expect(transaction.stdTxid).to.eq(txId);
        expect(transaction.hash).to.eq(txId);
    });

    it("should correctly parse type", function () {
        expect(transaction.type).to.eq("EscrowCreate");
    });

    it("should correctly parse unixTimestamp", function () {
        expect(transaction.unixTimestamp).to.eq(1787393331);
    });

    it("should correctly parse fee", function () {
        expect(transaction.fee).to.eq(fee);
    });

    it("should correctly parse reference", function () {
        expect(transaction.reference).to.deep.equal([memoHex]);
        expect(transaction.firstReference).to.eq(memoHex);
    });

    it("should return the null reference for a memo that is not 32 bytes", function () {
        expect(transaction.stdPaymentReference).to.eq(ZERO_BYTES_32);
    });

    it("should correctly parse destinationTag", function () {
        expect(transaction.destinationTag).to.eq(3189524378);
    });

    it("should correctly parse sourceAddresses", function () {
        expect(transaction.sourceAddresses).to.deep.equal([sender]);
    });

    it("should correctly parse receivingAddresses", function () {
        expect(transaction.receivingAddresses).to.deep.equal([]);
    });

    it("should correctly parse sourceAddressesRoot", function () {
        // Single-leaf Merkle root over `sourceAddresses` — only the fee payer.
        expect(transaction.sourceAddressesRoot).to.eq(
            "0xb6d3cc461b704ea0908dc4b83ff2c58e43e1d122b496e5e549cbba4f6f9ace10"
        );
    });

    it("should count only the fee as spentAmounts, not the escrowed IOU", function () {
        const expected = [{ address: sender, amount: fee }];
        expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
    });

    it("should correctly parse receivedAmounts", function () {
        const expected: AddressAmount[] = [];
        expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
    });

    it("should correctly parse feeSignerTotalAmount", function () {
        const expected = { address: sender, amount: fee };
        expect(singleAddressAmountEqual(transaction.feeSignerTotalAmount, expected)).to.be.true;
    });

    it("should return the realized amounts as intended amounts for a successful transaction", function () {
        const expectedSpent = [{ address: sender, amount: fee }];
        expect(AddressAmountEqual(transaction.intendedSpentAmounts, expectedSpent)).to.be.true;
        expect(AddressAmountEqual(transaction.intendedReceivedAmounts, [])).to.be.true;
    });

    it("should not be a native payment", function () {
        expect(transaction.isNativePayment).to.eq(false);
    });

    it("should not surface the spoofed IOU currency code as currencyName", function () {
        expect(transaction.currencyName).to.eq("");
    });

    it("should correctly parse elementaryUnits", function () {
        expect(transaction.elementaryUnits).to.eq(1000000);
    });

    it("should correctly parse successStatus", function () {
        expect(transaction.successStatus).to.eq(TransactionSuccessStatus.SUCCESS);
    });

    it("should not be an account create", function () {
        expect(transaction.isAccountCreate).to.eq(false);
    });

    it("should not get paymentSummary", function () {
        const summary = transaction.paymentSummary({ inUtxo: 0n, outUtxo: 0n });
        expect(summary.status).to.eq(PaymentSummaryStatus.NotNativePayment);
    });

    it("should not get xrpPaymentSummary", function () {
        const summary = transaction.xrpPaymentSummary();
        expect(summary.status).to.eq(PaymentSummaryStatus.NotNativePayment);
    });

    it("should not get paymentNonexistenceSummary", function () {
        const summary = transaction.paymentNonexistenceSummary();
        expect(summary.status).to.eq(PaymentNonexistenceSummaryStatus.NotNativePayment);
    });

    it("should get balanceDecreasingSummary for the sender", function () {
        const summary = transaction.balanceDecreasingSummary(standardAddressHash(sender));
        expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
        expect(summary.response!.sourceAddress).to.eq(sender);
        expect(summary.response!.spentAmount).to.eq(fee);
        expect(summary.response!.paymentReference).to.eq(ZERO_BYTES_32);
        expect(summary.response!.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
    });

    it("should not get balanceDecreasingSummary for the escrow destination", function () {
        const summary = transaction.balanceDecreasingSummary(standardAddressHash(destination));
        expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.NoSourceAddress);
    });
});
