import { expect } from "chai";
import { BtcTransaction, MCC, PaymentSummaryStatus, standardAddressHash, toHex32Bytes, traceManager, TransactionSuccessStatus, UtxoMccCreate } from "../../src";
import { getTestFile, transactionTestCases } from "../testUtils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const BtcMccConnection = {
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Transaction Btc base test, ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.BTC;

    before(async function () {
        traceManager.displayStateOnException = false;
        MccClient = new MCC.BTC(BtcMccConnection);
    });

    describe("Transaction does not exist ", function () {
        const txid = "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d37786156ff";

        it("Should get Invalid Transaction error ", async function () {
            await expect(MccClient.getTransaction(txid)).to.be.rejectedWith("InvalidTransaction");
        });
    });

    describe("Transaction full ", function () {
        const txid = "141479db9d6da30fafaf47e71ae6323cac57c391ea2f7f84754e0a70fea8e36a";
        let transaction: BtcTransaction;

        before(async () => {
            transaction = await MccClient.getTransaction(txid);
        });

        it("Should find transaction in block ", function () {
            expect(transaction).to.not.eq(undefined);
        });

        it("Should get transaction txid ", function () {
            expect(transaction.txid).to.eq(txid);
        });

        it("Should get standardized txid ", function () {
            expect(transaction.stdTxid).to.eq(txid);
        });

        it("Should get transaction reference array ", function () {
            expect(transaction.reference.length).to.eq(0);
        });

        it("Should get standardized transaction reference ", function () {
            expect(transaction.stdPaymentReference).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
        });

        it("Should get transaction timestamp ", function () {
            expect(transaction.unixTimestamp).to.eq(1647613710);
        });

        it("Should get source address ", function () {
            expect(transaction.sourceAddresses.length).to.eq(3);
            expect(transaction.sourceAddresses[0]).to.eq("bc1q38lr3a45xtlz8032sz8xwc72gs652wfcq046pzxtxx6c70nvpessnc8dyk");
            expect(transaction.sourceAddresses[1]).to.eq("bc1q6l2lz73tt4rzgaa08f6lyjrr67qkeynyqhn6hc66dncgh8c885fskxfkqw");
            expect(transaction.sourceAddresses[2]).to.eq("bc1q3952vvsc27n6sg57t85vwapjy0t6vr6ugru7fkqu5ae46c6xyc9q7r5scw");
        });

        it("Should get receiving address ", function () {
            expect(transaction.receivingAddresses.length).to.eq(6);
            expect(transaction.receivingAddresses[0]).to.eq("19Vxz7mg6YSgQhVB96YvXFsES1e8aXewHp");
        });

        it("Should get fee ", function () {
            expect(transaction.fee).to.eq(BigInt(43300));
        });

        it("Should spend amount 0", function () {
            expect(transaction.spentAmounts.length).to.eq(3);
            expect(transaction.spentAmounts[0].address).to.eq("bc1q38lr3a45xtlz8032sz8xwc72gs652wfcq046pzxtxx6c70nvpessnc8dyk");
            expect(transaction.spentAmounts[0].amount).to.eq(BigInt(7424891554));
        });

        it("Should spend amount 1", function () {
            expect(transaction.spentAmounts.length).to.eq(3);
            expect(transaction.spentAmounts[1].address).to.eq("bc1q6l2lz73tt4rzgaa08f6lyjrr67qkeynyqhn6hc66dncgh8c885fskxfkqw");
            expect(transaction.spentAmounts[1].amount).to.eq(BigInt(7424900255));
        });

        it("Should spend amount 2", function () {
            expect(transaction.spentAmounts.length).to.eq(3);
            expect(transaction.spentAmounts[2].address).to.eq("bc1q3952vvsc27n6sg57t85vwapjy0t6vr6ugru7fkqu5ae46c6xyc9q7r5scw");
            expect(transaction.spentAmounts[2].amount).to.eq(BigInt(7426316499));
        });

        it("Should received amount ", function () {
            expect(transaction.receivedAmounts.length).to.eq(6);
            expect(transaction.receivedAmounts[0].address).to.eq("19Vxz7mg6YSgQhVB96YvXFsES1e8aXewHp");
            expect(transaction.receivedAmounts[0].amount).to.eq(BigInt(237272503));
            expect(transaction.receivedAmounts[3].address).to.eq("bc1qe6mf8plmea4u6nun90qnw5gq6g3yp3sdr6gjkwt2jehuksr4vq3s8ykz97");
            expect(transaction.receivedAmounts[3].amount).to.eq(BigInt(7299851943));
            expect(transaction.receivedAmounts[4].address).to.eq("bc1qe6mf8plmea4u6nun90qnw5gq6g3yp3sdr6gjkwt2jehuksr4vq3s8ykz97");
            expect(transaction.receivedAmounts[4].amount).to.eq(BigInt(7299851943));
        });

        it("Should get type ", function () {
            expect(transaction.type).to.eq("payment");
        });

        it("Should check if native payment ", function () {
            expect(transaction.isNativePayment).to.eq(true);
        });

        it("Should get currency name ", function () {
            expect(transaction.currencyName).to.eq("BTC");
        });

        it("Should get elementary unit ", function () {
            expect(transaction.elementaryUnits).to.eq(100000000);
        });

        it("Should get success status ", function () {
            expect(transaction.successStatus).to.eq(0);
        });

        it("should make payment summmary", function () {
            const summary = transaction.paymentSummary({ inUtxo: 0, outUtxo: 3 });

            expect(summary.status).to.eq(PaymentSummaryStatus.Success);

            const resp = summary.response!;
            expect(resp.oneToOne).to.be.false;

            expect(resp.receivingAddress).to.eq("bc1qe6mf8plmea4u6nun90qnw5gq6g3yp3sdr6gjkwt2jehuksr4vq3s8ykz97");
            expect(resp.intendedReceivingAddress).to.eq("bc1qe6mf8plmea4u6nun90qnw5gq6g3yp3sdr6gjkwt2jehuksr4vq3s8ykz97");

            expect(resp.receivedAmount).to.eq(BigInt(2 * 7299851943));
            expect(resp.intendedReceivingAmount).to.eq(BigInt(2 * 7299851943));
        });

        it("Should make balance decreasing summary", function () {
            const summary = transaction.balanceDecreasingSummary(toHex32Bytes(1));

            expect(summary.status).to.eq(PaymentSummaryStatus.Success);

            const resp = summary.response!;

            expect(resp.isFull).to.be.true;
            expect(resp.sourceAddress).to.eq("bc1q6l2lz73tt4rzgaa08f6lyjrr67qkeynyqhn6hc66dncgh8c885fskxfkqw");
            expect(resp.transactionStatus).to.eq(TransactionSuccessStatus.SUCCESS);
            expect(resp.spentAmount).to.eq(BigInt(7424900255));
        });
    });

    const TransactionsToTest: transactionTestCases[] = [
        {
            description: "Transaction with one reference",
            txid: "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684",
            expect: {
                txid: "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684",
                stdTxid: "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684",
                hash: "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684",
                reference: ["636861726c6579206c6f766573206865696469"],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1404107109,
                sourceAddresses: ["1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg"],
                receivingAddresses: ["1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg", undefined],
                isFeeError: false,
                fee: BigInt(20000).toString(), // number as a string
                spentAmounts: [
                    {
                        address: "1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg",
                        amount: BigInt(220000),
                    },
                ],
                receivedAmounts: [
                    {
                        address: undefined,
                        amount: BigInt(0),
                    },
                    {
                        address: "1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg",
                        amount: BigInt(200000),
                    },
                ],
                type: "payment",
                isNativePayment: true,
                currencyName: "BTC",
                elementaryUnits: "100000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            makeFull: true,
            summary: {
                status: PaymentSummaryStatus.Success,
                response: {
                    blockTimestamp: 1404107109,
                    transactionHash: "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684",
                    sourceAddressHash: standardAddressHash("1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg"),
                    sourceAddress: "1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg",
                    receivingAddress: "1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg",
                    receivingAddressHash: standardAddressHash("1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg"),
                    spentAmount: BigInt(20000),
                    receivedAmount: BigInt(0),
                    paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                    intendedSourceAmount: BigInt(20000),
                    intendedReceivingAddressHash: standardAddressHash("1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg"),
                    intendedReceivingAddress: "1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg",
                    intendedReceivingAmount: BigInt(-20000),
                    oneToOne: false,
                    transactionStatus: TransactionSuccessStatus.SUCCESS,
                },
            },
        },
        {
            description: "Transaction with multiple vins",
            txid: "16920c5619b4c43fd5c9c0fc594153f2bf1a80c930238a8ee870aece0bc7cc59",
            expect: {
                txid: "16920c5619b4c43fd5c9c0fc594153f2bf1a80c930238a8ee870aece0bc7cc59",
                stdTxid: "16920c5619b4c43fd5c9c0fc594153f2bf1a80c930238a8ee870aece0bc7cc59",
                hash: "dda6777e407602bcec51963278b071a95a3a3f382fb73429ab203769d658da08",
                reference: [],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1647547988,
                sourceAddresses: [
                    "bc1qtwha4x2kcm6z05z4hn88atye3wq7aatrljrjly",
                    "bc1q0f3qgap02xejfjhj35wv6y5hc4yt9mthcjq5nu",
                    "bc1q7ydxwryw7u6xkkzhlddugv8hyzsd6u6c8zr7rc",
                ],
                receivingAddresses: ["bc1q7ydxwryw7u6xkkzhlddugv8hyzsd6u6c8zr7rc", "14PbdXD3gRMnrrsP4CnS66fYKHSb1aawea"],
                isFeeError: false,
                fee: "828", // number as a string
                spentAmounts: [
                    {
                        address: "bc1qtwha4x2kcm6z05z4hn88atye3wq7aatrljrjly",
                        amount: BigInt(3533),
                    },
                    {
                        address: "bc1q0f3qgap02xejfjhj35wv6y5hc4yt9mthcjq5nu",
                        amount: BigInt(5130),
                    },
                    {
                        address: "bc1q7ydxwryw7u6xkkzhlddugv8hyzsd6u6c8zr7rc",
                        amount: BigInt(6664),
                    },
                ],
                receivedAmounts: [
                    {
                        address: "bc1q7ydxwryw7u6xkkzhlddugv8hyzsd6u6c8zr7rc",
                        amount: BigInt(2259),
                    },
                    {
                        address: "14PbdXD3gRMnrrsP4CnS66fYKHSb1aawea",
                        amount: BigInt(12240),
                    },
                ],
                type: "payment",
                isNativePayment: true,
                currencyName: "BTC",
                elementaryUnits: "100000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            summary: {
                status: PaymentSummaryStatus.Success,
                response: {
                    transactionStatus: TransactionSuccessStatus.SUCCESS,
                    blockTimestamp: 1647547988,
                    transactionHash: "16920c5619b4c43fd5c9c0fc594153f2bf1a80c930238a8ee870aece0bc7cc59",
                    sourceAddress: "bc1qtwha4x2kcm6z05z4hn88atye3wq7aatrljrjly",
                    sourceAddressHash: standardAddressHash("bc1qtwha4x2kcm6z05z4hn88atye3wq7aatrljrjly"),
                    receivingAddress: "bc1q7ydxwryw7u6xkkzhlddugv8hyzsd6u6c8zr7rc",
                    receivingAddressHash: standardAddressHash("bc1q7ydxwryw7u6xkkzhlddugv8hyzsd6u6c8zr7rc"),
                    spentAmount: BigInt(3533),
                    receivedAmount: BigInt(2259 - 6664),
                    paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                    intendedSourceAmount: BigInt(3533),

                    intendedReceivingAddressHash: standardAddressHash("bc1q7ydxwryw7u6xkkzhlddugv8hyzsd6u6c8zr7rc"),
                    intendedReceivingAddress: "bc1q7ydxwryw7u6xkkzhlddugv8hyzsd6u6c8zr7rc",
                    intendedReceivingAmount: BigInt(6664 - 2259),
                    oneToOne: false,
                },
            },
        },
        {
            description: "Coinbase transaction with more reference",
            txid: "fbf351cd9f1a561be21e3977282e931c5209ed6b90472e225b4a674dbc643511",
            expect: {
                txid: "fbf351cd9f1a561be21e3977282e931c5209ed6b90472e225b4a674dbc643511",
                stdTxid: "fbf351cd9f1a561be21e3977282e931c5209ed6b90472e225b4a674dbc643511",
                hash: "0d7d19de1dff1bb5873d1cb790cb4087d5e3ba7607e001d4d5870b1e87872dc4",
                reference: [
                    "aa21a9ed7e2e11c040dbddce689e9a075f91f0bfa408cf3dadc229a0993ded3b4a9423e2",
                    "b9e11b6deaba71a095ba7fa47426cabe0b340a393b6eeecce598af3020a413ec1d7116e7",
                    "52534b424c4f434b3ab51f35a72153280cffb0721d9196f11c4830ebf63866e84ce24fae2c003e4e48",
                ],
                stdPaymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
                unixTimestamp: 1644814708,
                sourceAddresses: [undefined],
                receivingAddresses: ["1JvXhnHCi6XqcanvrZJ5s2Qiv4tsmm2UMy", undefined, undefined, undefined],
                isFeeError: false,
                fee: "0", // number as a string
                spentAmounts: [{ address: undefined, amount: BigInt(0) }],
                receivedAmounts: [
                    {
                        address: "1JvXhnHCi6XqcanvrZJ5s2Qiv4tsmm2UMy",
                        amount: BigInt(632706642),
                    },
                    {
                        address: undefined,
                        amount: BigInt(0),
                    },
                    {
                        address: undefined,
                        amount: BigInt(0),
                    },
                    {
                        address: undefined,
                        amount: BigInt(0),
                    },
                ],
                type: "coinbase",
                isNativePayment: true,
                currencyName: "BTC",
                elementaryUnits: "100000000", // number as string
                successStatus: TransactionSuccessStatus.SUCCESS,
            },
            summary: {
                status: PaymentSummaryStatus.Coinbase,
            },
        },
    ];

    for (const transData of TransactionsToTest) {
        describe(transData.description, function () {
            let transaction: BtcTransaction;
            before(async function () {
                const transactionb = await MccClient.getTransaction(transData.txid);
                if (transactionb !== null) {
                    transaction = transactionb;
                }
            });

            it("Should find transaction in block ", function () {
                expect(transaction).to.not.eq(undefined);
            });

            it("Should get transaction txid ", function () {
                expect(transaction.txid).to.eq(transData.expect.txid);
            });

            it("Should get standardized txid ", function () {
                expect(transaction.stdTxid).to.eq(transData.expect.stdTxid);
            });

            it("Should get transaction reference array ", function () {
                expect(transaction.reference.length).to.eq(transData.expect.reference.length);
                const a = transaction.reference.sort();
                const b = transData.expect.reference.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i]).to.eq(b[i]);
                }
            });

            it("Should get standardized transaction reference ", function () {
                expect(transaction.stdPaymentReference).to.eq(transData.expect.stdPaymentReference);
            });

            it("Should get transaction timestamp ", function () {
                expect(transaction.unixTimestamp).to.eq(transData.expect.unixTimestamp);
            });

            it("Should get source address ", function () {
                expect(transaction.sourceAddresses.length).to.eq(transData.expect.sourceAddresses.length);
                const a = transaction.sourceAddresses.sort();
                const b = transData.expect.sourceAddresses.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i]).to.eq(b[i]);
                }
            });

            it("Should get receiving address ", function () {
                expect(transaction.receivingAddresses.length).to.eq(transData.expect.receivingAddresses.length);
                const a = transaction.receivingAddresses.sort();
                const b = transData.expect.receivingAddresses.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i]).to.eq(b[i]);
                }
            });

            it("Should get fee ", function () {
                expect(transaction.fee.toString()).to.eq(transData.expect.fee);
            });

            it("Should spend amount ", function () {
                expect(transaction.spentAmounts.length).to.eq(transData.expect.spentAmounts.length);
                const a = transaction.spentAmounts.sort();
                const b = transData.expect.spentAmounts.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i].address).to.eq(b[i].address);
                    expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
                }
            });

            it("Should received amount ", function () {
                expect(transaction.receivedAmounts.length).to.eq(transData.expect.receivedAmounts.length);
                const a = transaction.receivedAmounts.sort();
                const b = transData.expect.receivedAmounts.sort();
                for (let i = 0; i < a.length; i++) {
                    expect(a[i].address).to.eq(b[i].address);
                    expect(a[i].amount.toString()).to.eq(b[i].amount.toString());
                }
            });

            it("Should get type ", function () {
                expect(transaction.type).to.eq(transData.expect.type);
            });

            it("Should check if native payment ", function () {
                expect(transaction.isNativePayment).to.eq(transData.expect.isNativePayment);
            });

            it("Should get currency name ", function () {
                expect(transaction.currencyName).to.eq(transData.expect.currencyName);
            });

            it("Should get elementary unit ", function () {
                expect(transaction.elementaryUnits.toString()).to.eq(transData.expect.elementaryUnits);
            });

            it("Should get success status ", function () {
                expect(transaction.successStatus).to.eq(transData.expect.successStatus);
            });

            it("Should get payment summary", function () {
                const summary = transaction.paymentSummary({ inUtxo: 0, outUtxo: 0 });

                if (summary.status === PaymentSummaryStatus.Success) {
                    console.log("prepeared (expected)");
                    expect(summary.status).to.eq(transData.summary.status);
                    if (summary.response && transData.summary.response) {
                        expect(summary.response.blockTimestamp).to.eq(transData.summary.response.blockTimestamp);
                        expect(summary.response.oneToOne).to.eq(transData.summary.response.oneToOne);
                        expect(summary.response.paymentReference).to.eq(transData.summary.response.paymentReference);
                        expect(summary.response.receivedAmount.toString()).to.eq(transData.summary.response.receivedAmount.toString());
                        expect(summary.response.receivingAddress).to.eq(transData.summary.response.receivingAddress);
                        expect(summary.response.spentAmount.toString()).to.eq(transData.summary.response.spentAmount.toString());
                        expect(summary.response.sourceAddress).to.eq(transData.summary.response.sourceAddress);
                        expect(summary.response.transactionHash).to.eq(transData.summary.response.transactionHash);
                        expect(summary.response.sourceAddressHash).to.eq(transData.summary.response.sourceAddressHash);
                        expect(summary.response.receivingAddressHash).to.eq(transData.summary.response.receivingAddressHash);
                        expect(summary.response.transactionStatus).to.eq(transData.summary.response.transactionStatus);
                    }
                }
            });

            // it("Should get payment summary 2", async function () {
            //    const summary = await transaction.paymentSummary(MccClient);
            //    expect(summary.isNativePayment).to.be.true;
            //    expect(summary.sourceAddress).to.be.undefined;
            //    expect(summary.receivingAddress).to.be.undefined;
            //    expect(summary.spentAmount?.toNumber()).to.eq(0);
            //    expect(summary.receivedAmount?.toNumber()).to.eq(0);
            // });
        });
    }

    describe("Transactions vin and vout indexes ", function () {
        const txid = "141479db9d6da30fafaf47e71ae6323cac57c391ea2f7f84754e0a70fea8e36a";
        let transaction: BtcTransaction;
        before(async () => {
            transaction = await MccClient.getTransaction(txid);
        });

        it("Should get vin index invalid ", function () {
            const fn = () => {
                return transaction.assertValidVinIndex(-2);
            };
            expect(fn).to.throw(Error);
        });
        it("Should get vout index invalid ", function () {
            const fn = () => {
                return transaction.assertValidVoutIndex(-2);
            };
            expect(fn).to.throw(Error);
        });

        // TODO: move to doge make full
        // it.skip("Should get synced vin index ", async function () {
        //     expect(transaction.isSyncedVinIndex(0)).to.be.false;
        // });

        // it.skip("Should not assert additional data and synchronize additional data ", async function () {
        //     const fn0 = () => {
        //         return transaction.assertAdditionalData();
        //     };
        //     expect(fn0).to.throw(Error);
        //     const fn00 = () => {
        //         return transaction.synchronizeAdditionalData();
        //     };
        //     expect(fn00).to.throw(Error);

        //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //     transaction._additionalData!.vinouts = [undefined, { index: Number.MAX_SAFE_INTEGER, vinvout: undefined }, { index: -1, vinvout: undefined }];
        //     const fn01 = () => {
        //         return transaction.synchronizeAdditionalData();
        //     };
        //     expect(fn01).to.throw(Error);

        //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //     transaction._additionalData!.vinouts = [{ index: 0, vinvout: undefined }];
        //     transaction.synchronizeAdditionalData();
        //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //     expect(transaction._additionalData!.vinouts[0]?.index).to.eq(0);

        //     transaction._data.vin.splice(-1);
        //     const fn1 = () => {
        //         return transaction.assertAdditionalData();
        //     };
        //     expect(fn1).to.throw(Error);
        //     delete transaction._additionalData?.vinouts;
        //     const fn2 = () => {
        //         return transaction.assertAdditionalData();
        //     };
        //     expect(fn2).to.throw(Error);
        //     // delete transaction._additionalData;
        //     // expect(transaction.assertAdditionalData()).to.be.undefined;
        // });

        // it("Should get the vout corresponding to vin", async function () {
        //     await expect(transaction.vinVoutAt(0)).to.be.rejected;
        // });
    });
});

// TODO special transactions

// https://www.blockchain.com/btc/tx/56214420a7c4dcc4832944298d169a75e93acf9721f00656b2ee0e4d194f9970
// https://www.blockchain.com/btc/tx/055f9c6dc094cf21fa224e1eb4a54ee3cc44ae9daa8aa47f98df5c73c48997f9
