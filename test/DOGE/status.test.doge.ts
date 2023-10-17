import { expect } from "chai";
import { MCC, UtxoMccCreate, UtxoNodeStatus } from "../../src";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe("Block DOGE base test ", function () {
    let MccClient: MCC.DOGE;
    let status: UtxoNodeStatus;

    before(async function () {
        MccClient = new MCC.DOGE(DogeMccConnection);
        status = await MccClient.getNodeStatus();
    });

    it("Should get status version ", async function () {
        const version = status.version.split("_");
        expect(version[0]).to.be.oneOf(["1140500", "1140600"]);
    });

    it("Should get status state ", async function () {
        expect(status.state).to.eq("full");
    });

    it("Should get status isHealthy ", async function () {
        expect(status.isHealthy).to.eq(true);
    });

    it("Should get status isSynced ", async function () {
        expect(status.isSynced).to.eq(true);
    });
});

describe("DOGE bottom block ", function () {
    let MccClient: MCC.DOGE;

    before(async function () {
        MccClient = new MCC.DOGE(DogeMccConnection);
    });

    it("Should get status version ", async function () {
        const bottom = await MccClient.getBottomBlockHeight();
        expect(bottom).to.eq(0);
    });
});
