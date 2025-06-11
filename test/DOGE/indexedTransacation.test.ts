import { expect } from "chai";
import { BalanceDecreasingSummaryStatus, DogeTransaction, PaymentSummaryStatus, standardAddressHash } from "../../src";
import { getTestFile } from "../testUtils";

const json = {
    txid: "314201bdcf89846333712220ee6e7eb92f0938f62008e5315f93d54db27230d8",
    time: 1700023314,
    vout: [
        {
            value: "1000.00000000",
            n: 0,
            scriptPubKey: {
                address: "2Muzjz36gXeMR1WY9Fhkmj2PLPtdmij1uAS",
                asm: "OP_HASH160 1e2b2d5703224b39d04efd1b275e886a8d8b0935 OP_EQUAL",
                hex: "a9141e2b2d5703224b39d04efd1b275e886a8d8b093587",
            },
        },
        {
            value: "8999.99666000",
            n: 1,
            scriptPubKey: {
                address: "2MytwDpHWpdoVYQ7JzYwBPxQ5XsEdiV7udZ",
                asm: "OP_HASH160 48f290ac02c1c42fffcfef1643400a16de0f523b OP_EQUAL",
                hex: "a91448f290ac02c1c42fffcfef1643400a16de0f523b87",
            },
        },
    ],
    blocktime: 1700023314,
    mediantime: 1700023314,
    hash: "314201bdcf89846333712220ee6e7eb92f0938f62008e5315f93d54db27230d8",
    version: 1,
    size: 0,
    vsize: 0,
    weight: 0,
    locktime: 0,
    hex: "",
    blockhash: "",
    confirmations: 0,
    vin: [
        {
            sequence: 4294967295,
            txid: "5c623a651feddf7c7cb56e1a8916afabd8c840086fac4ec1cc7ef892a5b13f39",
            vout: 0,
            prevout: {
                value: "10000.00000000",
                scriptPubKey: {
                    address: "2MytwDpHWpdoVYQ7JzYwBPxQ5XsEdiV7udZ",
                    asm: "OP_HASH160 48f290ac02c1c42fffcfef1643400a16de0f523b OP_EQUAL",
                    hex: "a91448f290ac02c1c42fffcfef1643400a16de0f523b87",
                },
            },
        },
    ],
};

describe(`doge indexed transaction test ,(${getTestFile(__filename)})`, function () {
    const tx = new DogeTransaction(json);

    it("should compute payment summary", function () {
        const summary = tx.paymentSummary({ inUtxo: 0n, outUtxo: 0n });

        expect(summary).to.not.be.undefined;
        expect(summary.status).to.eq(PaymentSummaryStatus.Success);
        expect(summary.response).to.not.be.undefined;
        expect(summary.response?.receivedAmount).to.eq(100000000000n);
        expect(summary.response?.spentAmount).to.eq(1000000000000n - 899999666000n);
    });

    it("should compute payment summary", function () {
        const summary = tx.paymentSummary({ inUtxo: 0n, outUtxo: 1n });

        expect(summary).to.not.be.undefined;
        expect(summary.status).to.eq(PaymentSummaryStatus.Success);
        expect(summary.response).to.not.be.undefined;
        expect(summary.response?.receivedAmount).to.eq(-1000000000000n + 899999666000n);
        expect(summary.response?.spentAmount).to.eq(1000000000000n - 899999666000n);
    });

    it("should compute balance decreasing summary", function () {
        const summary = tx.balanceDecreasingSummary(standardAddressHash("2MytwDpHWpdoVYQ7JzYwBPxQ5XsEdiV7udZ"));

        expect(summary).to.not.be.undefined;
        expect(summary.status).to.eq(BalanceDecreasingSummaryStatus.Success);
        expect(summary.response).to.not.be.undefined;
        expect(summary.response?.spentAmount).to.eq(1000000000000n - 899999666000n);
    });
});
