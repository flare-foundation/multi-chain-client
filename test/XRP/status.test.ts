import { expect } from "chai";
import { MCC, XrpNodeStatus } from "../../src";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
    rateLimitOptions: {
        timeoutMs: 15000,
    },
};

describe("Block Xrp base test ", function () {
    let MccClient: MCC.XRP;
    let status: XrpNodeStatus;

    before(async function () {
        MccClient = new MCC.XRP(XRPMccConnection);
        status = await MccClient.getNodeStatus();
    });

    it("Should get status version ", async function () {
        const version = status.version.split("_");
        expect(version[0]).to.be.oneOf(["1.9.1", "1.8.5", "1.9.4", "1.10.0", "1.10.1", "1.11.0"]);
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

describe("Xrp bottom block ", function () {
    let MccClient: MCC.XRP;

    before(async function () {
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    it("Should get status version ", async function () {
        const bottom = await MccClient.getBottomBlockHeight();
        expect(bottom).to.greaterThanOrEqual(32_570);
    });
});
