import { expect } from "chai";
import { MCC, UtxoMccCreate, UtxoNodeStatus } from "../../src";
import { getTestFile } from "../testUtils";

const BtcMccConnection = {
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
    rateLimitOptions: {
        timeoutMs: 15000,
    },
} as UtxoMccCreate;

describe(`Block BTC base test ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.BTC;
    let status: UtxoNodeStatus;

    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
        const tstatus = await MccClient.getNodeStatus();
        if (tstatus) {
            status = tstatus;
        }
    });

    it("Should get status version ", async function () {
        const version = status.version.split("_");
        expect(version[0]).to.be.oneOf(["280000", "280100"]); // 280000 is the version of the node that supports vout in vins for the transaction
    });

    it("Should get status state ", async function () {
        expect(status.state).to.be.eq("full");
    });

    it("Should get status isHealthy ", async function () {
        expect(status.isHealthy).to.eq(true);
    });

    it("Should get status isSynced ", async function () {
        expect(status.isSynced).to.eq(true);
    });
});

describe("BTC bottom block ", function () {
    let MccClient: MCC.BTC;

    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
    });

    it("Should get status version ", async function () {
        const bottom = await MccClient.getBottomBlockHeight();
        expect(bottom).to.eq(0);
    });
});
