import { expect } from "chai";
import { MCC, UtxoMccCreate } from "../../src";

const BtcMccConnection = {
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Template test ", function () {
    let MccClient: MCC.BTC;
    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
    });

    // A test to find some transactions on btc node that have op-return script entry and are not block mining transactions
    it.skip("Should find op return trans", async () => {
        const h = await MccClient.getBlockHeight();
        const block = await MccClient.getBlock(h);
        console.log(block?.blockHash);

        for (let i = 7; i < 20; i++) {
            const bl = await MccClient.getBlock(h - i);
            if (bl) {
                for (const tran of bl.stdTransactionIds) {
                    const t = await MccClient.getTransaction(tran);
                    if (t) {
                        if (t.type !== "coinbase" && t.reference.length > 0) {
                            console.log(t.stdTxid);
                            break;
                        }
                    }
                }
            }
        }
    });
});
