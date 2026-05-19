import { expect } from "chai";
import { TransactionMetadata } from "xrpl";
import { MCC, TransactionSuccessStatus } from "../../src";
import { XrpTransaction } from "../../src/base-objects";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://s1.ripple.com:51234",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
};

const XRPTestnetConnection = {
    url: process.env.XRP_URL_TESTNET || "https://s.altnet.rippletest.net:51234/",
    username: process.env.XRP_USERNAME_TESTNET || "",
    password: process.env.XRP_PASSWORD_TESTNET || "",
};

describe("XRP testnet client tests", () => {
    let client: MCC.XRP;

    before(function () {
        client = new MCC.XRP(XRPMccConnection);
    });

    describe("Should be able to get block height", function () {
        it(`Should be able to get block height `, async () => {
            const height = await client.getBlockHeight();
            expect(height).to.be.greaterThan(70_000_000);
        });
    });

    describe("Basic functionalities", function () {
        it("Should return block if exists", async () => {
            const n = 69453782;
            const block = await client.getBlock(n);
            if (block) {
                expect(block.number).to.equal(n);
            }
        });

        it("Should return InvalidBlock if block does not exist", async () => {
            let n = 85_000_0000;
            let block = client.getBlock(n);
            await expect(block).to.be.rejectedWith("InvalidBlock");
            n *= 100;
            block = client.getBlock(n);
            await expect(block).to.be.rejectedWith("InvalidBlock");
        });

        it("Should return transaction if exists", async () => {
            const txResponse = await client.getTransaction(
                "0x0569969AFDAF91BFCFF709D49FE23DD5656335AFD0A3879C03C8EFADEF83A0C2"
            );
            expect(txResponse).to.not.equal(null);
        });

        it("Should return null if transaction does not exist", async () => {
            const txResponse = client.getTransaction(
                "0669969AFDAF91BFCFF709D49FE23DD5656335AFD0A3879C03C8EFADEF83A0C2"
            );
            await expect(txResponse).to.be.rejectedWith("InvalidTransaction");
        });
    });

    describe("DomainID-driven tecNO_PERMISSION classification (testnet)", function () {
        // https://testnet.xrpl.org/transactions/C935D183BC7D63C3D91AD8AE73564A42315E2EE0C5C9A4E0B1F67A28F517FE25
        // XRP -> XRP Payment from a plain-funded sender to a plain-funded receiver,
        // carrying a random DomainID that no PermissionedDomain object exists for.
        // rippled returns tecNO_PERMISSION (Payment.cpp:391-397); MCC must report
        // SENDER_FAILURE because only the sender can attach sfDomainID.
        const txid = "C935D183BC7D63C3D91AD8AE73564A42315E2EE0C5C9A4E0B1F67A28F517FE25";
        let testnetClient: MCC.XRP;
        let transaction: XrpTransaction;

        before(async function () {
            testnetClient = new MCC.XRP(XRPTestnetConnection);
            transaction = await testnetClient.getTransaction(txid);
        });

        it("Fetches the transaction", function () {
            expect(transaction.txid).to.eq(txid);
        });

        it("Has TransactionResult = tecNO_PERMISSION", function () {
            const meta = transaction._data.result.meta as TransactionMetadata;
            expect(meta.TransactionResult).to.eq("tecNO_PERMISSION");
        });

        it("Carries sfDomainID on the transaction", function () {
            const txData = transaction._data.result as { DomainID?: string };
            expect(txData.DomainID).to.be.a("string");
        });

        it("Classifies as SENDER_FAILURE", function () {
            expect(transaction.successStatus).to.eq(TransactionSuccessStatus.SENDER_FAILURE);
        });
    });
});
