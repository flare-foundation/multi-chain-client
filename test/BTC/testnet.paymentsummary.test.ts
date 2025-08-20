import { expect } from "chai";
import { BtcTransaction, MCC, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

const BtcMccConnection = {
    url: process.env.TESTNET_BTC_URL || "",
    username: process.env.TESTNET_BTC_USERNAME || "",
    password: process.env.TESTNET_BTC_PASSWORD || "",
    rateLimitOptions: {
        timeoutMs: 15000,
    },
} as UtxoMccCreate;

describe.skip(`TESTNET: BTC payment summary with op return, ${getTestFile(__filename)}`, function () {
    let MccClient: MCC.BTC;
    let transaction: BtcTransaction;
    const txid = "67926749297f9ef450071585526fc2c0d0f1b9e40a8ac50d124c2e6d53c2c3b3";

    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
        transaction = await MccClient.getTransaction(txid);
    });

    //  it("Should return status", async function () {
    //     const status = await MccClient.getNodeStatus();

    //     console.log("status", status.version);

    //     console.dir(status, { depth: 10 });
    //  });

    it("Should be full transaction", async function () {
        expect(transaction.type).to.eq("payment");
    });

    it("Should get payment summary", async function () {
        const ps = transaction.paymentSummary({ inUtxo: 0n, outUtxo: 1n });
        console.dir(ps, { depth: 10 });
    });
});
