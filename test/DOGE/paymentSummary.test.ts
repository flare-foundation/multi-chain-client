import { expect } from "chai";
import {
    DogeTransaction,
    MCC,
    PaymentSummaryObject,
    PaymentSummaryStatus,
    standardAddressHash,
    TransactionSuccessStatus,
    UtxoMccCreate,
} from "../../src";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

interface TxFixture {
    txid: string;
    inUtxo: bigint;
    outUtxo: bigint;
    expectedStatus: PaymentSummaryStatus;
    expectedResponse?: {
        blockTimestamp: number;
        transactionHash: string;
        sourceAddress: string;
        spentAmount: bigint;
        paymentReference: string;
        transactionStatus: TransactionSuccessStatus;
        sourceAddressesRoot: string;
        receivingAddress: string;
        receivedAmount: bigint;
        intendedSourceAmount: bigint;
        intendedReceivingAddress: string;
        intendedReceivingAmount: bigint;
        oneToOne: boolean;
        toOne: boolean;
    };
}

const TX_FIXTURES: TxFixture[] = [
    // TODO: Add code to fetch data from this transaction or add predefined data from UTXO indexer
    // {
    //     // Multi-input payment with OP_RETURN (6 inputs, 3 outputs incl. OP_RETURN)
    //     txid: "f6c26a8fff36528a91fc938167448d2eb4e53dc76bd9fe7bcf23f9ea046ee269",
    //     inUtxo: 0n,
    //     outUtxo: 0n,
    //     expectedStatus: PaymentSummaryStatus.Success,
    //     expectedResponse: {
    //         blockTimestamp: 1740271233,
    //         transactionHash: "f6c26a8fff36528a91fc938167448d2eb4e53dc76bd9fe7bcf23f9ea046ee269",
    //         sourceAddress: "DQvLEnW1izBJVf5wdMEgxAon2JJ7cjdj1k",
    //         spentAmount: 1000000n,
    //         paymentReference: "0x6a2046425052664100010000000000000000000000000000000000000000004277ac",
    //         transactionStatus: TransactionSuccessStatus.SUCCESS,
    //         sourceAddressesRoot: "0xaf6b8714e31de010c317cb0be390cc5e6cb592b32ff6502ebf8cc1c9ea53f46f",
    //         receivingAddress: "DLaMH4zVAAcWCsCfPZUnrQcMcsxWssHfjc",
    //         receivedAmount: 141400000000n,
    //         intendedSourceAmount: 1000000n,
    //         intendedReceivingAddress: "DLaMH4zVAAcWCsCfPZUnrQcMcsxWssHfjc",
    //         intendedReceivingAmount: 141400000000n,
    //         oneToOne: false,
    //         toOne: true,
    //     },
    // },
];

describe(`dogePaymentSummary fixture tests (${getTestFile(__filename)})`, () => {
    for (const { txid, inUtxo, outUtxo, expectedStatus, expectedResponse } of TX_FIXTURES) {
        describe(`dogePaymentSummary for txid ${txid} (inUtxo=${inUtxo}, outUtxo=${outUtxo})`, () => {
            let transaction: DogeTransaction;
            let summary: PaymentSummaryObject;
            before(async () => {
                const client = new MCC.DOGE(DogeMccConnection);
                transaction = await client.getTransaction(txid);
            });

            it("should return expected status", () => {
                const summaryResponse = transaction.paymentSummary({ inUtxo, outUtxo });
                expect(summaryResponse.status).to.eq(expectedStatus);
                if (summaryResponse === undefined) {
                    return 0;
                } else {
                    summary = summaryResponse.response!;
                }
            });

            if (expectedResponse) {
                it("should match blockTimestamp", () => {
                    expect(summary.blockTimestamp).to.eq(expectedResponse.blockTimestamp);
                });

                it("should match transactionHash", () => {
                    expect(summary.transactionHash).to.eq(expectedResponse.transactionHash);
                });

                it("should match sourceAddress and sourceAddressHash", () => {
                    expect(summary.sourceAddressHash).to.eq(standardAddressHash(expectedResponse.sourceAddress));
                });

                it("should match spentAmount", () => {
                    expect(summary.spentAmount).to.eq(expectedResponse.spentAmount);
                });

                it("should match paymentReference", () => {
                    expect(summary.paymentReference).to.eq(expectedResponse.paymentReference);
                });

                it("should match transactionStatus", () => {
                    expect(summary.transactionStatus).to.eq(expectedResponse.transactionStatus);
                });

                it("should match sourceAddressesRoot", () => {
                    expect(summary.sourceAddressesRoot).to.eq(expectedResponse.sourceAddressesRoot);
                });

                it("should match receivingAddress and receivingAddressHash", () => {
                    expect(summary.receivingAddressHash).to.eq(standardAddressHash(expectedResponse.receivingAddress));
                });

                it("should match receivedAmount", () => {
                    expect(summary.receivedAmount).to.eq(expectedResponse.receivedAmount);
                });

                it("should match intendedSourceAmount", () => {
                    expect(summary.intendedSourceAmount).to.eq(expectedResponse.intendedSourceAmount);
                });

                it("should match intendedReceivingAddress and intendedReceivingAddressHash", () => {
                    expect(summary.intendedReceivingAddressHash).to.eq(
                        standardAddressHash(expectedResponse.intendedReceivingAddress)
                    );
                });

                it("should match intendedReceivingAmount", () => {
                    expect(summary.intendedReceivingAmount).to.eq(expectedResponse.intendedReceivingAmount);
                });

                it("should match oneToOne", () => {
                    expect(summary.oneToOne).to.eq(expectedResponse.oneToOne);
                });

                it("should match toOne", () => {
                    expect(summary.toOne).to.eq(expectedResponse.toOne);
                });
            }
        });
    }
});
