import { expect } from "chai";
import {
    MCC,
    XrpTransaction,
    PaymentSummaryStatus,
    TransactionSuccessStatus,
    standardAddressHash,
    ZERO_BYTES_32,
} from "../../src";
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
            paymentReference: "0x4642505266410001000000000000000000000000000000000000000000010A1D",
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
    {
        // Token (non-native) payment — Amount is IssuedCurrencyAmount
        txid: "041DCB1F45EE585E322D0DC9E7EAF5516276D77AA60F573AA95ACEDC92149865",
        expectedStatus: PaymentSummaryStatus.NotNativePayment,
    },
    {
        // Non-Payment transaction type (OfferCreate)
        txid: "03BED73A8CC08F456F0DDE8DA32AB4687189553A6107C6E44575D571E9C9B203",
        expectedStatus: PaymentSummaryStatus.NotNativePayment,
    },
    {
        // Failed native payment (tecUNFUNDED_PAYMENT) — only fee charged, intended amounts differ
        txid: "25D477BFDF5E2AC0945BC94020A17BBAECF7565CC099F750BE599F2C20B8A88D",
        expectedStatus: PaymentSummaryStatus.Success,
        expectedResponse: {
            blockTimestamp: 1774009341,
            transactionHash: "25D477BFDF5E2AC0945BC94020A17BBAECF7565CC099F750BE599F2C20B8A88D",
            sourceAddress: "rUg8ac5ikpTaWk5RPei8xuYkNEyUs53G1i",
            spentAmount: "12",
            paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            transactionStatus: TransactionSuccessStatus.SENDER_FAILURE,
            sourceAddressesRoot: "0x793faa5313c626264c4afa8aa1a92622a5eeffbe31d4cab85cc4408a8df0f084",
            receivingAddress: "",
            receivedAmount: "0",
            intendedSourceAmount: "1479",
            intendedReceivingAddress: "rJn2zAPdFA193sixJwuFixRkYDUtx3apQh",
            intendedReceivingAmount: "1467",
            oneToOne: true,
            toOne: true,
            hasDestinationTag: true,
            destinationTag: 500304425,
            hasMemoData: false,
            memoData: "",
        },
    },
    {
        // Native XRP payment with both memo (non-32-byte) and destination tag
        txid: "5E5313BA3C55755ED3FDACB53C53A7143997D997DAF5FB5C24B83C6B995D6363",
        expectedStatus: PaymentSummaryStatus.Success,
        expectedResponse: {
            blockTimestamp: 1754785822,
            transactionHash: "5E5313BA3C55755ED3FDACB53C53A7143997D997DAF5FB5C24B83C6B995D6363",
            sourceAddress: "r4Sut5JyyLg1Kuvv5iXcYytuLH1QjhHxgt",
            spentAmount: "100012",
            paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            transactionStatus: TransactionSuccessStatus.SUCCESS,
            sourceAddressesRoot: "0xf29486ac001386a9026cce30c03e0de155f2ae80aa8a34f3ea9e384023b1cfe1",
            receivingAddress: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
            receivedAmount: "100000",
            intendedSourceAmount: "100012",
            intendedReceivingAddress: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
            intendedReceivingAmount: "100000",
            oneToOne: true,
            toOne: true,
            hasDestinationTag: true,
            destinationTag: 1337,
            hasMemoData: true,
            memoData: "506C6174666F726D2074726164696E6720666565",
        },
    },
    {
        // Native XRP payment with short memo (not valid 32-byte hex), no destination tag
        txid: "40027B84516C765760F978893F1CD0F6429A687702D09A84A47811EC6C6E7E11",
        expectedStatus: PaymentSummaryStatus.Success,
        expectedResponse: {
            blockTimestamp: 1774009341,
            transactionHash: "40027B84516C765760F978893F1CD0F6429A687702D09A84A47811EC6C6E7E11",
            sourceAddress: "rNYt2yMY1h4Zjcc57uVjDsRyZunFSQUrJp",
            spentAmount: "90012",
            paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            transactionStatus: TransactionSuccessStatus.SUCCESS,
            sourceAddressesRoot: "0xff31f8f021003519a929a7d8fcb581befb0eb714070581a502eb56cc9757fd38",
            receivingAddress: "ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt",
            receivedAmount: "90000",
            intendedSourceAmount: "90012",
            intendedReceivingAddress: "ryouhapPYV5KNHmFUKrjNqsjxhnxvQiVt",
            intendedReceivingAmount: "90000",
            oneToOne: true,
            toOne: true,
            hasDestinationTag: false,
            destinationTag: 0,
            hasMemoData: true,
            memoData: "58616D616E205365727669636520466565",
        },
    },
    {
        // Token (non-native) payment with SourceTag and multiple memos
        txid: "3255B72043649284ED1CB1EB6A3C04FB423C8FD896B3351E9EA86AD7BB255B37",
        expectedStatus: PaymentSummaryStatus.NotNativePayment,
    },
    {
        // Native XRP payment with destination tag and memo (non-32-byte), successful
        txid: "BD68A2A9FE47AF15948546FFDDE90C731E346983F559B25B6A9B4F38E7E8BD3B",
        expectedStatus: PaymentSummaryStatus.Success,
        expectedResponse: {
            blockTimestamp: 1774169631,
            transactionHash: "BD68A2A9FE47AF15948546FFDDE90C731E346983F559B25B6A9B4F38E7E8BD3B",
            sourceAddress: "rw7xfeKdaPjeExHbotrMkAXraKh5yrzkTh",
            spentAmount: "1000000012",
            paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            transactionStatus: TransactionSuccessStatus.SUCCESS,
            sourceAddressesRoot: "0x33130fa66ea9fe618d7fffbd58cd1f4ed00070e1fb8cf8e20c22f08a8a49e1b8",
            receivingAddress: "rNxp4h8apvRis6mJf9Sh8C6iRxfrDWN7AV",
            receivedAmount: "1000000000",
            intendedSourceAmount: "1000000012",
            intendedReceivingAddress: "rNxp4h8apvRis6mJf9Sh8C6iRxfrDWN7AV",
            intendedReceivingAmount: "1000000000",
            oneToOne: true,
            toOne: true,
            hasDestinationTag: true,
            destinationTag: 485359384,
            hasMemoData: true,
            memoData: "343835333539333834",
        },
    },
    {
        // Native XRP payment with destination tag and long memo (40-byte), successful
        txid: "8782615413487AFEA56AB6051D145A4CA3C127EAB8A1FC7D8E857513B525488D",
        expectedStatus: PaymentSummaryStatus.Success,
        expectedResponse: {
            blockTimestamp: 1774170071,
            transactionHash: "8782615413487AFEA56AB6051D145A4CA3C127EAB8A1FC7D8E857513B525488D",
            sourceAddress: "rPBJGLCysYLSrfH6SttjoWkYW3Pvu2qPR",
            spentAmount: "1410804",
            paymentReference: "0x0000000000000000000000000000000000000000000000000000000000000000",
            transactionStatus: TransactionSuccessStatus.SUCCESS,
            sourceAddressesRoot: "0x1339873c3302c32ce3153f42984d8936382451535d0bed5a894621f507649fcb",
            receivingAddress: "rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg",
            receivedAmount: "1405533",
            intendedSourceAmount: "1410804",
            intendedReceivingAddress: "rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg",
            intendedReceivingAmount: "1405533",
            oneToOne: true,
            toOne: true,
            hasDestinationTag: true,
            destinationTag: 3751335421,
            hasMemoData: true,
            memoData: "446562742052656170696E673B205250525F564F54455F52554E7C323032362D30332D3232543039",
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
                it("should have response defined", () => {
                    const summary = transaction.xrpPaymentSummary();
                    expect(summary.response).to.not.be.undefined;
                });

                it("should match blockTimestamp", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.blockTimestamp).to.eq(expectedResponse.blockTimestamp);
                });

                it("should match transactionHash", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.transactionHash).to.eq(expectedResponse.transactionHash);
                });

                it("should match sourceAddress and sourceAddressHash", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.sourceAddressHash).to.eq(standardAddressHash(expectedResponse.sourceAddress));
                });

                it("should match spentAmount", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.spentAmount.toString()).to.eq(expectedResponse.spentAmount);
                });

                it("should match paymentReference", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.paymentReference).to.eq(expectedResponse.paymentReference);
                });

                it("should match transactionStatus", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.transactionStatus).to.eq(expectedResponse.transactionStatus);
                });

                it("should match sourceAddressesRoot", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.sourceAddressesRoot).to.eq(expectedResponse.sourceAddressesRoot);
                });

                it("should match receivingAddress and receivingAddressHash", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    if (expectedResponse.receivingAddress === "") {
                        expect(response.receivingAddressHash).to.eq(ZERO_BYTES_32);
                        expect(response.receivingAddress).to.eq("");
                    } else {
                        expect(response.receivingAddressHash).to.eq(
                            standardAddressHash(expectedResponse.receivingAddress)
                        );
                    }
                });

                it("should match receivedAmount", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.receivedAmount.toString()).to.eq(expectedResponse.receivedAmount);
                });

                it("should match intendedSourceAmount", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.intendedSourceAmount.toString()).to.eq(expectedResponse.intendedSourceAmount);
                });

                it("should match intendedReceivingAddress and intendedReceivingAddressHash", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.intendedReceivingAddressHash).to.eq(
                        standardAddressHash(expectedResponse.intendedReceivingAddress)
                    );
                });

                it("should match intendedReceivingAmount", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.intendedReceivingAmount.toString()).to.eq(expectedResponse.intendedReceivingAmount);
                });

                it("should match oneToOne", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.oneToOne).to.eq(expectedResponse.oneToOne);
                });

                it("should match toOne", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.toOne).to.eq(expectedResponse.toOne);
                });

                it("should match hasDestinationTag and destinationTag", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.hasDestinationTag).to.eq(expectedResponse.hasDestinationTag);
                    expect(response.destinationTag).to.eq(expectedResponse.destinationTag);
                });

                it("should match hasMemoData and memoData", () => {
                    const response = transaction.xrpPaymentSummary().response!;
                    expect(response.hasMemoData).to.eq(expectedResponse.hasMemoData);
                    expect(response.memoData).to.eq(expectedResponse.memoData);
                });
            }
        });
    }
});
