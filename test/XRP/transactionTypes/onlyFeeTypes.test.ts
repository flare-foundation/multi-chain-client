import { expect } from "chai";
import { AddressAmount, MCC, XrpTransaction, traceManager } from "../../../src";
import { AddressAmountEqual } from "../../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://xrplcluster.com",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("Type where no xrp or assets are transferred", function () {
    let MccClient: MCC.XRP;

    before(async function () {
        traceManager.displayRuntimeTrace = false;
        traceManager.displayStateOnException = false;
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    describe("AccountSet", function () {
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction("327FD263132A4D08170E1B01FE1BB2E21D0126CE58165C97A9173CA9551BCD70");
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: BigInt("10") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            expect(transaction.receivedAmounts).to.deep.equal([]);
        });

        // Token transfers
        // it.skip("should correctly parse assetSourceAddresses", async function () {
        //    expect(transaction.assetSourceAddresses).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetReceivingAddresses", async function () {
        //    expect(transaction.assetReceivingAddresses).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetSpentAmounts", async function () {
        //    expect(transaction.assetSpentAmounts).to.deep.equal([]);
        // });

        // it.skip("should correctly parse assetReceivedAmounts", async function () {
        //    expect(transaction.assetReceivedAmounts).to.deep.equal([]);
        // });
    });

    describe("CheckCancel", function () {
        // TODO: Find example where account delete transfers both native XRP and an issued token (Asset)
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction("D3328000315C6DCEC1426E4E549288E3672752385D86A40D56856DBD10382953");
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal(["r4uZkneFvKrbNVJgtB3tBJooMBryzySnEa"]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: "r4uZkneFvKrbNVJgtB3tBJooMBryzySnEa", amount: BigInt("12") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            expect(transaction.receivedAmounts).to.deep.equal([]);
        });
    });

    describe("CheckCreate", function () {
        // TODO: Find example where account delete transfers both native XRP and an issued token (Asset)
        let transaction: XrpTransaction;
        before(async function () {
            transaction = await MccClient.getTransaction("4E0AA11CBDD1760DE95B68DF2ABBE75C9698CEB548BEA9789053FCB3EBD444FB");
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal(["rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn"]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn", amount: BigInt("10") }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            expect(transaction.receivedAmounts).to.deep.equal([]);
        });
    });

    describe("DepositPreAuth", function () {
        let transaction: XrpTransaction;
        const txId = "CB1BF910C93D050254C049E9003DA1A265C107E0C8DE4A7CFF55FADFD39D5656";
        const address = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn";
        const fee = "10";

        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("NFTokenBurn", function () {
        let transaction: XrpTransaction;

        const address = "rhpe8vRiZ8NvVn6MnFTwL2TxzMeCUhSeVQ";
        const txId = "7B9EFDFDC801C58F2B61B89AA2751634F49CE2A93923671FF0F4F099C7EE17FF";
        const fee = "12";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("NFTokenCancelOffer", function () {
        let transaction: XrpTransaction;

        const address = "rnkmrTjpPTnVHkWCkVHLLVpspLKhyBCPm5";
        const txId = "9FF6366C19F762AE3479DC01390CDE17F1055EFF0C52A28B8ACF0CC11AEF0CC5";
        const fee = "15";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("NFTokenCreateOffer", function () {
        let transaction: XrpTransaction;

        const address = "rPmjAYZJ6WgxoVcpnteZWYUSXfh8RaGnD2";
        const txId = "780C44B2EDFF8FC4152B3F7E98D4C435C13DF9BB5498E4BB2D019FCC7EF45BC6";
        const fee = "20";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("NFTokenMint", function () {
        let transaction: XrpTransaction;

        const address = "rU2T6qNSab9N4SQZAEutwWnkzA7vUGWcfQ";
        const txId = "B42C7A0C9C3061463C619999942D0F25E4AE5FB051EA0D7A4EE1A924DB6DFEE8";
        const fee = "12";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("OfferCancel", function () {
        let transaction: XrpTransaction;

        const address = "rJkg989h7fPaJLm9CEyAsdvwgZYtKs2zzz";
        const txId = "E7697D162A606FCC138C5732BF0D2A4AED49386DC59235FC3E218650AAC19744";
        const fee = "12";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("SetRegularKey", function () {
        let transaction: XrpTransaction;

        const address = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn";
        const txId = "6AA6F6EAAAB56E65F7F738A9A2A8A7525439D65BA990E9BA08F6F4B1C2D349B4";
        const fee = "10";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("SignerListSet", function () {
        let transaction: XrpTransaction;

        const address = "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn";
        const txId = "09A9C86BF20695735AB03620EB1C32606635AC3DA0B70282F37C674FC889EFE7";
        const fee = "15";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("TicketCreate", function () {
        let transaction: XrpTransaction;

        const address = "rGoZQPxErbUtYMQefhRvXLN2epnAmWGZ5Y";
        const txId = "738AEF36B48CA4A2D85C2B74910DC34DDBBCA4C83643F2DB84A58785ED5AD3E3";
        const fee = "50000";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });

    describe("TrustSet", function () {
        let transaction: XrpTransaction;

        const address = "r9qheokwreSsfdFqvYzYerrTa6xGpD8N5r";
        const txId = "8566673ECD0A9731C516906E5D2F47129C5C13713602140733831A56CEAE1A05";
        const fee = "20";
        before(async function () {
            transaction = await MccClient.getTransaction(txId);
        });

        it("should correctly parse sourceAddresses", async function () {
            expect(transaction.sourceAddresses).to.deep.equal([address]);
        });

        it("should correctly parse receivingAddresses", async function () {
            expect(transaction.receivingAddresses).to.deep.equal([]);
        });

        it("should correctly parse spentAmounts", async function () {
            const expected = [{ address: address, amount: BigInt(fee) }];
            expect(AddressAmountEqual(transaction.spentAmounts, expected)).to.be.true;
        });

        it("should correctly parse receivedAmounts", async function () {
            const expected: AddressAmount[] = [];
            expect(AddressAmountEqual(transaction.receivedAmounts, expected)).to.be.true;
        });
    });
});
