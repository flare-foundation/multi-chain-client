import { expect } from "chai";
import { DogeTransaction, IUtxoVinVoutsMapper, MCC, PaymentSummaryStatus, UtxoMccCreate, toBN } from "../../src";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

interface AdditionalDataAsserts {
    index: number;
    value: number;
    address: string;
}

describe(`Transaction Doge test ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.DOGE;

    // CONSTANTS
    const txid = "a4d9dbd0047cc48526586fc6d64d4404ba594f5e152e268a48d0abbd786782bc";
    const expected_add: AdditionalDataAsserts[] = [
        {
            index: 0,
            value: 3967436.83298823,
            address: "D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P",
        },
        {
            index: 1,
            value: 353.657103,
            address: "D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P",
        },
        {
            index: 2,
            value: 1.00000001,
            address: "D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P",
        },
        {
            index: 3,
            value: 556.75685312,
            address: "D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P",
        },
    ];

    before(async function () {
        MccClient = new MCC.DOGE(DogeMccConnection);
    });

    it("Should update transaction type when making full ", async function () {
        const transaction = await MccClient.getTransaction(txid);
        expect(transaction.type).to.eq("payment");

        expect(transaction.type).to.eq("full_payment");
    });

    describe("On Full transaction", async function () {
        let transaction: DogeTransaction;

        before(async function () {
            transaction = await MccClient.getTransaction(txid);
        });

        it("Should check payment summary inUtxo: 0 ; outUtxo: 0 ", async function () {
            const paymentSummary = await transaction.paymentSummary({
                inUtxo: 0,
                outUtxo: 0,
            });

            // console.dir(paymentSummary);

            expect(paymentSummary.status).to.eq("success");

            if (paymentSummary.response) {
                expect(paymentSummary.response.sourceAddress).to.eq("D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P");
                expect(paymentSummary.response.spentAmount.toString(10)).to.eq("54809811860");
                expect(paymentSummary.response.receivedAmount.toString(10)).to.eq("54272811860");
            } else {
                expect(false).to.be.true;
            }
        });

        it("Should check payment summary inUtxo: 0 ; outUtxo: 1 ", async function () {
            const paymentSummary = await transaction.paymentSummary({
                inUtxo: 0,
                outUtxo: 1,
            });

            // console.dir(paymentSummary);

            expect(paymentSummary.status).to.eq("success");

            if (paymentSummary.response) {
                expect(paymentSummary.response.sourceAddress).to.eq("D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P");
                expect(paymentSummary.response.spentAmount.toString(10)).to.eq("54809811860");
                expect(paymentSummary.response.receivedAmount.toString(10)).to.eq("-54809811860");
            } else {
                expect(false).to.be.true;
            }
        });

        it("Should check payment summary inUtxo: 0 ; outUtxo: 2 ", async function () {
            const paymentSummary = await transaction.paymentSummary({
                inUtxo: 0,
                outUtxo: 2,
            });

            expect(paymentSummary.status).to.eq(PaymentSummaryStatus.NoReceiveAmountAddress);
        });
    });
});
