import { expect } from "chai";
import { MCC, UtxoBlock, UtxoMccCreate } from "../../src";

const LtcMccConnection = {
   url: process.env.LTC_URL || "",
   username: process.env.LTC_USERNAME || "",
   password: process.env.LTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Block LTC base test ", function () {
   let MccClient: MCC.LTC;
   let block: UtxoBlock;
   const blockNumber = 2_220_000
   
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
      // TODO at least check some txids
   });

   it("Should get transaction standard ids ", async function () {
      expect(block.stdTransactionIds.length).to.eq(61);
   });

   it("Should get transaction count ", async function () {
      expect(block.transactionCount).to.eq(61);
   });
});
