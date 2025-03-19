import { expect } from "chai";
import { MCC, UtxoMccCreate, retry } from "../../src";
import { getTestFile } from "../testUtils";

const BtcMccConnection = {
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Chain tips test (${getTestFile(__filename)})`, function () {
    let MccClient: MCC.BTC;
    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
    });

    it.skip("Should get only latest tips ", async function () {
        // TODO: node does not keep track of orphan blocks when restarting
        const tips = await retry("", () => MccClient.getBlockTips(730_698));
        expect(tips.length).to.greaterThanOrEqual(2);
    });

    it("Should get tips and all blocks to certain height ", async function () {
        const tips = await retry("", () => MccClient.getTopLiteBlocks(5));
        // Most of the time eq
        expect(tips.length).to.greaterThanOrEqual(5);
    });
});
