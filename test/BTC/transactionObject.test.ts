/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "chai";
import { BtcTransaction, MCC, PaymentSummaryStatus, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

const BtcMccConnection = {
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Transaction Btc test ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.BTC;

    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
    });

    describe("Transaction full processed ", function () {
        const txid = "0x4d58bd737d87eb2011ba7e0d33d3a0c8f94f13020dd096f8d1b96849c9660a53";
        let transaction: BtcTransaction;

        before(async () => {
            transaction = await MccClient.getTransaction(txid);

            // await transaction.makeFullPayment(MccClient);
        });

        it("Should get transaction txid ", async function () {
            expect(transaction.txid).to.eq("4d58bd737d87eb2011ba7e0d33d3a0c8f94f13020dd096f8d1b96849c9660a53");
        });

        it("Should get standardized txid ", async function () {
            expect(transaction.stdTxid).to.eq("4d58bd737d87eb2011ba7e0d33d3a0c8f94f13020dd096f8d1b96849c9660a53");
        });

        it("Should get transaction reference array ", async function () {
            expect(transaction.reference.length).to.eq(0);
        });

        it("Should get standardized transaction reference ", async function () {
            expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
        });

        it("Should get transaction timestamp ", async function () {
            // From https://blockstream.info/tx/4d58bd737d87eb2011ba7e0d33d3a0c8f94f13020dd096f8d1b96849c9660a53
            expect(transaction.unixTimestamp).to.eq(1650342330);
        });

        it("Should get source address ", async function () {
            expect(transaction.sourceAddresses.length).to.eq(2);
            expect(transaction.sourceAddresses[0]).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
            expect(transaction.sourceAddresses[1]).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
        });

        it("Should get receiving address ", async function () {
            expect(transaction.receivingAddresses.length).to.eq(2);
            expect(transaction.receivingAddresses[0]).to.eq("1KiJkugknjgW6AHXNgVQgNuo3b5DqsVFmk");
            expect(transaction.receivingAddresses[1]).to.eq("bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej");
        });

        it("Should get fee ", async function () {
            expect(transaction.fee).to.eq(BigInt(40000));
        });

        it("Should spend amount ", async function () {
            expect(transaction.spentAmounts.length).to.eq(2);
            expect(transaction.spentAmounts[0].address).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
            expect(transaction.spentAmounts[0].amount).to.eq(BigInt(400000000));
            expect(transaction.spentAmounts[1].address).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
            expect(transaction.spentAmounts[1].amount).to.eq(BigInt(400000000));
        });

        it("Should received amount ", async function () {
            expect(transaction.receivedAmounts.length).to.eq(2);
            expect(transaction.receivedAmounts[0].address).to.eq("1KiJkugknjgW6AHXNgVQgNuo3b5DqsVFmk");
            expect(transaction.receivedAmounts[0].amount).to.eq(BigInt(494000000));
            expect(transaction.receivedAmounts[1].address).to.eq("bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej");
            expect(transaction.receivedAmounts[1].amount).to.eq(BigInt(305960000));
        });

        it("Should get type ", async function () {
            expect(transaction.type).to.eq("payment");
        });

        it("Should check if native payment ", async function () {
            expect(transaction.isNativePayment).to.eq(true);
        });

        it("Should get currency name ", async function () {
            expect(transaction.currencyName).to.eq("BTC");
        });

        it("Should get elementary unit ", async function () {
            expect(transaction.elementaryUnits).to.eq(100000000);
        });

        it("Should get success status ", async function () {
            expect(transaction.successStatus).to.eq(0);
        });

        it("Should get payment summary from utxo 0 to utxo 0", async function () {
            const summary = transaction.paymentSummary({ inUtxo: 0, outUtxo: 0 });

            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            expect(summary.response).to.exist;

            expect(summary.response!.sourceAddress).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
            expect(summary.response!.receivingAddress).to.eq("1KiJkugknjgW6AHXNgVQgNuo3b5DqsVFmk");
            expect(summary.response!.spentAmount).to.eq(BigInt(800000000));
            expect(summary.response!.receivedAmount).to.eq(BigInt(494000000));
            expect(summary.response!.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
            expect(summary.response!.oneToOne).to.eq(false);
        });

        it("Should get payment summary from utxo 0 to utxo 1", async function () {
            const summary = transaction.paymentSummary({ inUtxo: 0, outUtxo: 1 });

            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            expect(summary.response).to.exist;

            expect(summary.response!.sourceAddress).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
            expect(summary.response!.receivingAddress).to.eq("bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej");
            expect(summary.response!.spentAmount).to.eq(BigInt(800000000));
            expect(summary.response!.receivedAmount).to.eq(BigInt(305960000));
            expect(summary.response!.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
            expect(summary.response!.oneToOne).to.eq(false);
        });

        it("Should get payment summary from utxo 1 to utxo 0", async function () {
            const summary = transaction.paymentSummary({ inUtxo: 1, outUtxo: 0 });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            expect(summary.response).to.exist;

            expect(summary.response!.sourceAddress).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
            expect(summary.response!.receivingAddress).to.eq("1KiJkugknjgW6AHXNgVQgNuo3b5DqsVFmk");
            expect(summary.response!.spentAmount).to.eq(BigInt(800000000));
            expect(summary.response!.receivedAmount).to.eq(BigInt(494000000));
            expect(summary.response!.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
            expect(summary.response!.oneToOne).to.eq(false);
        });

        it("Should get payment summary from utxo 1 to utxo 1", async function () {
            const summary = transaction.paymentSummary({ inUtxo: 1, outUtxo: 1 });
            expect(summary.status).to.eq(PaymentSummaryStatus.Success);
            expect(summary.response).to.exist;

            expect(summary.response!.sourceAddress).to.eq("bc1qdl753ur9ucwa3cgfrud2nqvu7k69dykk3cwwx6g64a5szn3xw92sp8mc7a");
            expect(summary.response!.receivingAddress).to.eq("bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej");
            expect(summary.response!.spentAmount).to.eq(BigInt(800000000));
            expect(summary.response!.receivedAmount).to.eq(BigInt(305960000));
            expect(summary.response!.paymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
            expect(summary.response!.oneToOne).to.eq(false);
        });
    });
});
