import { expect } from "chai";
import { LtcBlock, MCC, UtxoMccCreate } from "../../src";

const LtcMccConnection = {
   url: process.env.LTC_URL || "",
   username: process.env.LTC_USERNAME || "",
   password: process.env.LTC_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe("Block LTC base test ", function () {
   let MccClient: MCC.LTC;
   let block: LtcBlock;
   const blockNumber = 2_220_000;

   before(async function () {
      MccClient = new MCC.LTC(LtcMccConnection);
      block = await MccClient.getBlock(blockNumber);
   });

   it("Should get block", async function () {
      expect(block).to.not.eq(undefined);
   });

   it("Should get block number ", async function () {
      expect(block.number).to.eq(blockNumber);
   });

   it("Should get block hash ", async function () {
      expect(block.blockHash).to.eq("2e7c0facdf8482585ee70161f07969e2201165a9632ea205b5f06a5ccc08c368");
   });

   it("Should get block standard hash ", async function () {
      expect(block.stdBlockHash).to.eq("2e7c0facdf8482585ee70161f07969e2201165a9632ea205b5f06a5ccc08c368");
   });

   it("Should get block timestamp ", async function () {
      expect(block.unixTimestamp).to.eq(1646170721);
   });

   it("Should get transaction ids ", async function () {
      expect(block.transactionIds.length).to.eq(61);
      expect(block.transactionIds).contain("0xe109b57a5489370e9e076565fc17d3cc760d794dacda8f574b29b58b089b8a0d");
      expect(block.transactionIds).contain("0xa1823dccdf2721c0cbb01402cf33b35fe290736bfb396d41b42bf30d475b1465");
   });

   it("Should get transaction standard ids ", async function () {
      expect(block.stdTransactionIds.length).to.eq(61);
   });

   it("Should get transaction count ", async function () {
      expect(block.transactionCount).to.eq(61);
   });
});
