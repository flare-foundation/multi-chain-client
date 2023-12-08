import { expect } from "chai";
import { MCC, UtxoMccCreate, retry } from "../../src";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Chain tips test ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.DOGE;
    before(async function () {
        MccClient = new MCC.DOGE(DogeMccConnection);
    });

    it("Should get only latest tips ", async function () {
        const tips = await retry("", () => MccClient.getBlockTips(4_045_000));
        expect(tips.length).to.greaterThanOrEqual(70);
    });

    it("Should get latest orphaned block ", async function () {
        const tips = await retry("", () => MccClient.getBlockTips(0));
        let latest = tips.length > 0 ? tips[0] : undefined;
        let latestH = 0;
        for (const tip of tips) {
            if (tip.chainTipStatus !== "active") {
                if (tip.number > latestH) {
                    latestH = tip.number;
                    latest = tip;
                }
            }
        }
        expect(latest?.number).to.greaterThanOrEqual(4406287);
    });

    it("Should get tips and all blocks to certain height ", async function () {
        const tips = await retry("", () => MccClient.getTopLiteBlocks(5));
        // Most of the time eq
        // console.log(tips);

        expect(tips.length).to.greaterThanOrEqual(5);
    });
});
