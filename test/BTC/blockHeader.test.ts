import { expect } from "chai";
import { BtcBlockHeader, MCC, UtxoMccCreate, UtxoNodeStatus } from "../../src";
import { getTestFile } from "../testUtils";

const BtcMccConnection = {
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
    url: process.env.BTC_URL || "",
    username: process.env.BTC_USERNAME || "",
    password: process.env.BTC_PASSWORD || "",
    rateLimitOptions: {
        timeoutMs: 15000,
    },
} as UtxoMccCreate;

describe(`Block Header BTC base,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.BTC;

    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
    });

    it("Should get block header from number ", async function () {
        const blockHeader = await MccClient.getBlockHeader(819120);
        expect(blockHeader).to.not.eq(undefined);
    });

    it("Should get block header from hash ", async function () {
        const blockHeader = await MccClient.getBlockHeader(
            "00000000000000000000eefe8d88fc63c6154c495cfa4f319e0c746f81597af0"
        );
        expect(blockHeader).to.not.eq(undefined);
    });
});

describe(`Block Header BTC getters ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.BTC;
    let blockHeader: BtcBlockHeader;

    before(async function () {
        MccClient = new MCC.BTC(BtcMccConnection);
        blockHeader = await MccClient.getBlockHeader(819120);
    });

    it("Should test blockHash getter ", async function () {
        expect(blockHeader.blockHash).to.eq("00000000000000000000eefe8d88fc63c6154c495cfa4f319e0c746f81597af0");
    });

    it("Should test stdBlockHash getter ", async function () {
        expect(blockHeader.stdBlockHash).to.eq("00000000000000000000eefe8d88fc63c6154c495cfa4f319e0c746f81597af0");
    });

    it("Should test number getter ", async function () {
        expect(blockHeader.number).to.eq(819120);
    });

    it("Should test timestamp (mediantime) getter ", async function () {
        expect(blockHeader.unixTimestamp).to.eq(1701344823);
    });

    it("Should test blockHash getter ", async function () {
        expect(blockHeader.transactionCount).to.eq(3211);
    });

    it("Should test previousBlockHash getter ", async function () {
        expect(blockHeader.previousBlockHash).to.eq("000000000000000000036a4cc18f3bb1416fe5b5cf1dc77ffc3e0dab1cdb771a");
    });

    it("Should test stdPreviousBlockHash getter ", async function () {
        expect(blockHeader.stdPreviousBlockHash).to.eq(
            "000000000000000000036a4cc18f3bb1416fe5b5cf1dc77ffc3e0dab1cdb771a"
        );
    });
});
