import { assert, expect } from "chai";
import { DogeTransaction, MCC, PaymentSummaryStatus, toBN, traceManager, TransactionSuccessStatus, UtxoMccCreate, UtxoTransaction } from "../../src";
import { transactionTestCases } from "../testUtils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe("Transaction DOGE base test ", function () {
    let MccClient: MCC.DOGE;

    before(async function () {
        traceManager.displayStateOnException = false;

        MccClient = new MCC.DOGE(DogeMccConnection);
    });

    describe("Transaction does not exist ", function () {
        const txid = "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d37786156ff";

        it("Should get transaction does not exist ", async function () {
            const transaction = MccClient.getTransaction(txid);
            await expect(transaction).to.be.rejectedWith("InvalidTransaction");
        });
    });

    const TransactionsToTest: transactionTestCases[] = [
        {
            description: "Transaction 1 ",
            txid: "de07c395ab9e3d987f13f72ee71f0b3ba4217c3b4df6f9dd928fe579c014b90e",
            expect: {
                txid: "de07c395ab9e3d987f13f72ee71f0b3ba4217c3b4df6f9dd928fe579c014b90e",
                stdTxid: "de07c395ab9e3d987f13f72ee71f0b3ba4217c3b4df6f9dd928fe579c014b90e",
                hash: "de07c395ab9e3d987f13f72ee71f0b3ba4217c3b4df6f9dd928fe579c014b90e",
                reference: [],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1647899747,
                sourceAddresses: [undefined],
                receivingAddresses: ["DPcBYzf5vGemYGtWK6BZbvHqvCSAzwpscv", "9theYDTPbCniM4Rdnza3RdeCw4d1H68sDz"],
                isFeeError: true,
                fee: "InvalidResponse", // number as a string
                spentAmounts: [
                    {
                        address: undefined,
                        amount: toBN(0),
                    },
                ],
                receivedAmounts: [
                    {
                        address: "DPcBYzf5vGemYGtWK6BZbvHqvCSAzwpscv",
                        amount: toBN(27791743986),
                    },
                    {
                        address: "9theYDTPbCniM4Rdnza3RdeCw4d1H68sDz",
                        amount: toBN(1677708425369),
                    },
                ],
                type: "partial_payment",
                isNativePayment: true,
                currencyName: "DOGE",
                elementaryUnits: "100000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            summary: {
                status: PaymentSummaryStatus.Success,
            },
        },
        {
            description: "Coinbase Transaction",
            txid: "9d863418ef3761eb45fd38eea5074965efa1266694a8b2826d5ce148aa564095",
            expect: {
                txid: "9d863418ef3761eb45fd38eea5074965efa1266694a8b2826d5ce148aa564095",
                stdTxid: "9d863418ef3761eb45fd38eea5074965efa1266694a8b2826d5ce148aa564095",
                hash: "9d863418ef3761eb45fd38eea5074965efa1266694a8b2826d5ce148aa564095",
                reference: [],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1647899747,
                sourceAddresses: [undefined],
                receivingAddresses: ["DMr3fEiVrPWFpoCWS958zNtqgnFb7QWn9D"],
                isFeeError: false,
                fee: "0", // number as a string
                spentAmounts: [
                    {
                        address: undefined,
                        amount: toBN(0),
                    },
                ],
                receivedAmounts: [
                    {
                        address: "DMr3fEiVrPWFpoCWS958zNtqgnFb7QWn9D",
                        amount: toBN(1001181448000),
                    },
                ],
                type: "coinbase",
                isNativePayment: true,
                currencyName: "DOGE",
                elementaryUnits: "100000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            summary: {
                status: PaymentSummaryStatus.Success,
            },
        },
    ];

    for (const transData of TransactionsToTest) {
        describe(transData.description, function () {
            let transaction: DogeTransaction;
            before(async function () {
                transaction = await MccClient.getTransaction(transData.txid);
            });

            it("Should find transaction in block ", function () {
                expect(transaction).to.not.eq(undefined);
            });

            it("Should get transaction txid ", async function () {
                expect(transaction.txid).to.eq(transData.expect.txid);
            });

            it("Should get standardized txid ", async function () {
                expect(transaction.stdTxid).to.eq(transData.expect.stdTxid);
            });

            it("Should get transaction reference array ", async function () {
                expect(transaction.reference.length).to.eq(transData.expect.reference.length);
                const a = transaction.reference.sort();
                const b = transData.expect.reference.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i]).to.eq(b[i]);
                }
            });

            it("Should get standardized transaction reference ", async function () {
                expect(transaction.stdPaymentReference).to.eq(transData.expect.stdPaymentReference);
            });

            it("Should get transaction timestamp ", async function () {
                expect(transaction.unixTimestamp).to.eq(transData.expect.unixTimestamp);
            });

            it("Should get source address ", async function () {
                expect(transaction.sourceAddresses.length).to.eq(transData.expect.sourceAddresses.length);
                const a = transaction.sourceAddresses.sort();
                const b = transData.expect.sourceAddresses.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i]).to.eq(b[i]);
                }
            });

            it("Should get receiving address ", async function () {
                expect(transaction.receivingAddresses.length).to.eq(transData.expect.receivingAddresses.length);
                const a = transaction.receivingAddresses.sort();
                const b = transData.expect.receivingAddresses.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i]).to.eq(b[i]);
                }
            });

            it("Should get fee ", async function () {
                if (transData.expect.isFeeError) {
                    expect(function () {
                        transaction.fee;
                    }).to.throw(transData.expect.fee);
                } else {
                    expect(transaction.fee.toString()).to.eq(transData.expect.fee);
                }
            });

            it("Should spend amount ", async function () {
                expect(transaction.spentAmounts.length).to.eq(transData.expect.spentAmounts.length);
                const a = transaction.spentAmounts.sort();
                const b = transData.expect.spentAmounts.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i].address).to.eq(b[i].address);
                    expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
                }
            });

            it("Should received amount ", async function () {
                expect(transaction.receivedAmounts.length).to.eq(transData.expect.receivedAmounts.length);
                const a = transaction.receivedAmounts.sort();
                const b = transData.expect.receivedAmounts.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i].address).to.eq(b[i].address);
                    expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
                }
            });

            it("Should get type ", async function () {
                expect(transaction.type).to.eq(transData.expect.type);
            });

            it("Should check if native payment ", async function () {
                expect(transaction.isNativePayment).to.eq(transData.expect.isNativePayment);
            });

            it("Should get currency name ", async function () {
                expect(transaction.currencyName).to.eq(transData.expect.currencyName);
            });

            it("Should get elementary unit ", async function () {
                expect(transaction.elementaryUnits.toString()).to.eq(transData.expect.elementaryUnits);
            });

            it("Should get success status ", async function () {
                expect(transaction.successStatus).to.eq(transData.expect.successStatus);
            });
        });
    }
});
