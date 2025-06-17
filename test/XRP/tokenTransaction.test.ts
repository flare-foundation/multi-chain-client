import { MCC, PaymentSummaryStatus, retry, TransactionSuccessStatus, XrpTransaction } from "../../src";
import { getTestFile, transactionTestCases } from "../testUtils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
const expect = chai.expect;
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
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    const TransactionsToTest: transactionTestCases[] = [
        {
            description: "Token CORE",
            txid: "546433CEADAEEDB0DF3B67221F9FE6E2041482775C4BD67F34A41476F766B189",
            expect: {
                txid: "546433CEADAEEDB0DF3B67221F9FE6E2041482775C4BD67F34A41476F766B189",
                stdTxid: "546433CEADAEEDB0DF3B67221F9FE6E2041482775C4BD67F34A41476F766B189",
                hash: "546433CEADAEEDB0DF3B67221F9FE6E2041482775C4BD67F34A41476F766B189",
                reference: [
                    "436F7265756D202824434F524529203574682041697264726F702028415052203230323220536E617073686F7429202D2049443A2032323031363834202D20636F7265756D2E636F6D",
                ],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1654092632,
                sourceAddresses: ["rBrY6tLYMYYRRFAXwKtZoFYF6kpb7ZCore"],
                sourceAddressesRoot: "0x2f4c68c4164a962d468629187815054f2501155079be82ff1f9eb932ce494547",
                receivingAddresses: [],
                isFeeError: false,
                fee: "10000", // number as a string
                spentAmounts: [
                    {
                        address: "rBrY6tLYMYYRRFAXwKtZoFYF6kpb7ZCore",
                        amount: BigInt(10000),
                    },
                ],
                receivedAmounts: [],
                type: "Payment",
                isNativePayment: false,
                currencyName: "434F524500000000000000000000000000000000",
                elementaryUnits: "1000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            summary: {
                status: PaymentSummaryStatus.Success,
            },
        },
        {
            description: "Token LOVE",
            txid: "D0DBB956BD1DEFAB0CB46246F111B567BBD2D0CA090C26AFD57782C7C8C4BCE1",
            expect: {
                txid: "D0DBB956BD1DEFAB0CB46246F111B567BBD2D0CA090C26AFD57782C7C8C4BCE1",
                stdTxid: "D0DBB956BD1DEFAB0CB46246F111B567BBD2D0CA090C26AFD57782C7C8C4BCE1",
                hash: "D0DBB956BD1DEFAB0CB46246F111B567BBD2D0CA090C26AFD57782C7C8C4BCE1",
                reference: ["596F752063616E277420757365207468652066617563657420666F7220746865206E65787420323420686F757273"],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1654092640,
                sourceAddresses: ["rMNTSXzmWmvMHGRC7QKNfdJycTPG7WxE7e"],
                sourceAddressesRoot: "0x5d98ed608711f48b6725eb050677c517f5e621f4ff1f1159ffdb491a7ba58d4c",
                receivingAddresses: [],
                isFeeError: false,
                fee: "50", // number as a string
                spentAmounts: [
                    {
                        address: "rMNTSXzmWmvMHGRC7QKNfdJycTPG7WxE7e",
                        amount: BigInt(50),
                    },
                ],
                receivedAmounts: [],
                type: "Payment",
                isNativePayment: false,
                currencyName: "4C4F564500000000000000000000000000000000",
                elementaryUnits: "1000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            summary: {
                status: PaymentSummaryStatus.Success,
            },
        },
        {
            description: "Token CX1",
            txid: "69BE6AAD4A8D0991E72AA23ECB15C7847A0D3D44E3B23CE6BDA53701B7E0F9D2",
            expect: {
                txid: "69BE6AAD4A8D0991E72AA23ECB15C7847A0D3D44E3B23CE6BDA53701B7E0F9D2",
                stdTxid: "69BE6AAD4A8D0991E72AA23ECB15C7847A0D3D44E3B23CE6BDA53701B7E0F9D2",
                hash: "69BE6AAD4A8D0991E72AA23ECB15C7847A0D3D44E3B23CE6BDA53701B7E0F9D2",
                reference: ["4358312046617563657420F09F8E89"],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1654096800,
                sourceAddresses: ["rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1"],
                sourceAddressesRoot: "0xc7d20587c32cd6d71fd2dcce451dc5480f4d80b75a4909c41bc1fb1d55b350ef",
                receivingAddresses: [],
                isFeeError: false,
                fee: "20", // number as a string
                spentAmounts: [
                    {
                        address: "rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1",
                        amount: BigInt(20),
                    },
                ],
                receivedAmounts: [],
                type: "Payment",
                isNativePayment: false,
                currencyName: "CX1",
                elementaryUnits: "1000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            summary: {
                status: PaymentSummaryStatus.Success,
            },
        },
        {
            description: "Token Blessed",
            txid: "84464F5001B9E7FD79C448B9C5F01085ACE56E94A1F6E2A737FDE9A993086F16",
            expect: {
                txid: "84464F5001B9E7FD79C448B9C5F01085ACE56E94A1F6E2A737FDE9A993086F16",
                stdTxid: "84464F5001B9E7FD79C448B9C5F01085ACE56E94A1F6E2A737FDE9A993086F16",
                hash: "84464F5001B9E7FD79C448B9C5F01085ACE56E94A1F6E2A737FDE9A993086F16",
                reference: [],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1646141781,
                sourceAddresses: ["rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF"],
                sourceAddressesRoot: "0x98b81aac3bb21450ad887d3a06fcbff832299c19aba6386a508dee9600a038f5",
                receivingAddresses: [],
                isFeeError: false,
                fee: "10", // number as a string
                spentAmounts: [
                    {
                        address: "rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF",
                        amount: BigInt(10),
                    },
                ],
                receivedAmounts: [],
                type: "Payment",
                isNativePayment: false,
                currencyName: "426C657373656400000000000000000000000000",
                elementaryUnits: "1000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            summary: {
                status: PaymentSummaryStatus.Success,
            },
        },
    ];

    for (const transData of TransactionsToTest) {
        describe(transData.description, function () {
            let transaction: XrpTransaction;
            before(async function () {
                transaction = await retry("get test transactions", () => MccClient.getTransaction(transData.txid));
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

            it("Should get transaction hash ", async function () {
                expect(transaction.hash).to.eq(transData.expect.hash);
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

            it("Should get source address root ", async function () {
                expect(transaction.sourceAddressesRoot).to.eq(transData.expect.sourceAddressesRoot);
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

            // it("Should get payment summary ", async function () {
            //    const summary = await transaction.paymentSummary(MccClient);
            //    expect(summary.isNativePayment).to.eq(false);
            // });
        });
    }
});
