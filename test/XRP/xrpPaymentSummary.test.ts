import { expect } from "chai";
import { MCC, XrpTransaction, PaymentSummaryStatus, TransactionSuccessStatus, standardAddressHash } from "../../src";
import { getTestFile } from "../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
};

interface TxFixture {
    txid: string;
    expectedStatus: PaymentSummaryStatus;
    expectedResponse?: {
        blockTimestamp: number;
        transactionHash: string;
        sourceAddress: string;
        spentAmount: string;
        paymentReference: string;
        transactionStatus: TransactionSuccessStatus;
        sourceAddressesRoot: string;
        receivingAddress: string;
        receivedAmount: string;
        intendedSourceAmount: string;
        intendedReceivingAddress: string;
        intendedReceivingAmount: string;
        oneToOne: boolean;
        toOne: boolean;
        hasDestinationTag: boolean;
        destinationTag: number;
        hasMemoData: boolean;
        memoData: string;
    };
}

const TX_FIXTURES: TxFixture[] = [
    {
        // Simple native XRP payment, no memo, no destination tag
        txid: "A66F0CA18ED693D0D3BEAAD9C15DDA9DAA8A4D44C3C7028831F27456F316B7D4",
        expectedStatus: PaymentSummaryStatus.Success,
        expectedResponse: {
            blockTimestamp: 1773865180,
            transactionHash: "A66F0CA18ED693D0D3BEAAD9C15DDA9DAA8A4D44C3C7028831F27456F316B7D4",
            sourceAddress: "rRmgo6NW1W7GHjC5qEpcpQnq8NE74ZS1P",
            spentAmount: "21874182",
            paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            transactionStatus: TransactionSuccessStatus.SUCCESS,
            sourceAddressesRoot: "0xd8dc2a8850f967273009b1dc791d093dc80e780ecea804414186a96dfb9e4d95",
            receivingAddress: "rGn6Gqe1yYiGiSQfxRzowkjd39HGuPYAEv",
            receivedAmount: "21874162",
            intendedSourceAmount: "21874182",
            intendedReceivingAddress: "rGn6Gqe1yYiGiSQfxRzowkjd39HGuPYAEv",
            intendedReceivingAmount: "21874162",
            oneToOne: true,
            toOne: true,
            hasDestinationTag: false,
            destinationTag: 0,
            hasMemoData: false,
            memoData: "",
        },
    },
    {
        // Native XRP payment with memo data (valid 32-byte payment reference)
        txid: "C38B67406B0C34BD18FE775135132DCF0F08F87165D812DFBA4AA81B3774744D",
        expectedStatus: PaymentSummaryStatus.Success,
        expectedResponse: {
            blockTimestamp: 1757915670,
            transactionHash: "C38B67406B0C34BD18FE775135132DCF0F08F87165D812DFBA4AA81B3774744D",
            sourceAddress: "rNp4GS9MuLnFPH7aXheCQ18Vxc4rAyNeKN",
            spentAmount: "10010012",
            paymentReference:
                "0x4642505266410001000000000000000000000000000000000000000000010A1D",
            transactionStatus: TransactionSuccessStatus.SUCCESS,
            sourceAddressesRoot: "0xd829e6c47b88a7deb71bb92c18f111f379fea068f13369c3d0b768f03c1461e0",
            receivingAddress: "rEUvL6uJ1NYqa81tGxjH6BnLCQRzqT1aR7",
            receivedAmount: "10010000",
            intendedSourceAmount: "10010012",
            intendedReceivingAddress: "rEUvL6uJ1NYqa81tGxjH6BnLCQRzqT1aR7",
            intendedReceivingAmount: "10010000",
            oneToOne: true,
            toOne: true,
            hasDestinationTag: false,
            destinationTag: 0,
            hasMemoData: true,
            memoData: "4642505266410001000000000000000000000000000000000000000000010A1D",
        },
    },
    {
        // Native XRP payment with destination tag, no memo
        txid: "3DA3F56A9FA75552DD6C26A590183817BB1C0E659DEFB650542E07819B70F9A1",
        expectedStatus: PaymentSummaryStatus.Success,
        expectedResponse: {
            blockTimestamp: 1773234941,
            transactionHash: "3DA3F56A9FA75552DD6C26A590183817BB1C0E659DEFB650542E07819B70F9A1",
            sourceAddress: "rUg8ac5ikpTaWk5RPei8xuYkNEyUs53G1i",
            spentAmount: "633",
            paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            transactionStatus: TransactionSuccessStatus.SUCCESS,
            sourceAddressesRoot: "0x793faa5313c626264c4afa8aa1a92622a5eeffbe31d4cab85cc4408a8df0f084",
            receivingAddress: "rGDreBvnHrX1get7na3J4oowN19ny4GzFn",
            receivedAmount: "621",
            intendedSourceAmount: "633",
            intendedReceivingAddress: "rGDreBvnHrX1get7na3J4oowN19ny4GzFn",
            intendedReceivingAmount: "621",
            oneToOne: true,
            toOne: true,
            hasDestinationTag: true,
            destinationTag: 289317105,
            hasMemoData: false,
            memoData: "",
        },
    },
];

describe(`xrpPaymentSummary fixture tests (${getTestFile(__filename)})`, () => {
    for (const { txid, expectedStatus, expectedResponse } of TX_FIXTURES) {
        describe(`xrpPaymentSummary for txid ${txid}`, () => {
            let transaction: XrpTransaction;
            before(async () => {
                const client = new MCC.XRP(XRPMccConnection);
                transaction = await client.getTransaction(txid);
            });

            it("should return expected status", () => {
                const summary = transaction.xrpPaymentSummary();
                expect(summary.status).to.eq(expectedStatus);
            });

            if (expectedResponse) {
                it("should return expected response fields", () => {
                    const summary = transaction.xrpPaymentSummary();
                    expect(summary.response).to.not.be.undefined;
                    const response = summary.response!;

                    // SummaryObjectBase fields
                    expect(response.blockTimestamp).to.eq(expectedResponse.blockTimestamp);
                    expect(response.transactionHash).to.eq(expectedResponse.transactionHash);
                    expect(response.sourceAddressHash).to.eq(standardAddressHash(expectedResponse.sourceAddress));
                    expect(response.spentAmount.toString()).to.eq(expectedResponse.spentAmount);
                    expect(response.paymentReference).to.eq(expectedResponse.paymentReference);
                    expect(response.transactionStatus).to.eq(expectedResponse.transactionStatus);

                    // PaymentSummaryObject fields
                    expect(response.sourceAddressesRoot).to.eq(expectedResponse.sourceAddressesRoot);
                    expect(response.receivingAddressHash).to.eq(standardAddressHash(expectedResponse.receivingAddress));
                    expect(response.receivedAmount.toString()).to.eq(expectedResponse.receivedAmount);
                    expect(response.intendedSourceAmount.toString()).to.eq(expectedResponse.intendedSourceAmount);
                    expect(response.intendedReceivingAddressHash).to.eq(
                        standardAddressHash(expectedResponse.intendedReceivingAddress)
                    );
                    expect(response.intendedReceivingAmount.toString()).to.eq(expectedResponse.intendedReceivingAmount);
                    expect(response.oneToOne).to.eq(expectedResponse.oneToOne);
                    expect(response.toOne).to.eq(expectedResponse.toOne);

                    // XrpPaymentSummaryObject fields
                    expect(response.hasDestinationTag).to.eq(expectedResponse.hasDestinationTag);
                    expect(response.destinationTag).to.eq(expectedResponse.destinationTag);
                    expect(response.hasMemoData).to.eq(expectedResponse.hasMemoData);
                    expect(response.memoData).to.eq(expectedResponse.memoData);
                });
            }
        });
    }
});
