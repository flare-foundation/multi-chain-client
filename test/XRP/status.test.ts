import { expect } from "chai";
import { MCC, XrpNodeStatus, retry } from "../../src";
import { getTestFile } from "../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",

    rateLimitOptions: {
        timeoutMs: 15000,
    },
};

describe(`Block Xrp base test (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;
    let status: XrpNodeStatus;

    before(async function () {
        MccClient = new MCC.XRP(XRPMccConnection);
        status = await retry("", () => MccClient.getNodeStatus());
    });

    it("Should get status version ", async function () {
        const version = status.version.split("_");
        console.log(version);
        expect(version[0]).to.be.oneOf(["2.5.0", "2.6.0"]);
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

describe(`Xrp bottom block (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    it("Should get status version ", async function () {
        const bottom = await retry("", () => MccClient.getBottomBlockHeight());
        expect(bottom).to.greaterThanOrEqual(32_570);
    });
});
