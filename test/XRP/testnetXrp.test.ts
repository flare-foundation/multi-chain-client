import { expect } from "chai";
import { MCC } from "../../src";

const XRPMccConnection = {
    url: process.env.XRP_URL || "https://s1.ripple.com:51234",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
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
});
