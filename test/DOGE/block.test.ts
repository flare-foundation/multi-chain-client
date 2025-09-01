import { expect } from "chai";
import { MCC, UtxoBlock, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

describe(`Block DOGE base test ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.DOGE;
    let block: UtxoBlock;
    const blockHush = "e36e336dbf7854b80d48e34ff62390b34ba18e604bdfd0c5b2bd4b61580aa8c4";

    before(async function () {
        MccClient = new MCC.DOGE(DogeMccConnection);
        block = await MccClient.getBlock(blockHush);
    });

    it("Should get block", function () {
        expect(block).to.not.eq(undefined);
    });

    it("Should get block number ", function () {
        expect(block.number).to.eq(4151820);
    });

    it("Should get block hash ", function () {
        expect(block.blockHash).to.eq(blockHush);
    });

    it("Should get block standard hash ", function () {
        expect(block.stdBlockHash).to.eq(blockHush);
    });

    it("Should get block timestamp ", function () {
        expect(block.unixTimestamp).to.eq(1647901036);
    });

    it("Should get transaction ids ", function () {
        expect(block.transactionIds.length).to.eq(26);
        const a = block.transactionIds.sort();
        expect(a[0]).to.eq("0x0087fed70a569ac99c7a72373e0a62afd0a63d7675193b18fd02215562235e7e");
    });

    it("Should get transaction standard ids ", function () {
        expect(block.stdTransactionIds.length).to.eq(26);
    });

    it("Should get transaction count ", function () {
        expect(block.transactionCount).to.eq(26);
    });
});
