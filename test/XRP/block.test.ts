import { expect } from "chai";
import { MCC, XrpBlock } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
};

describe("Block Xrp base test ", function () {
   let MccClient: MCC.XRP;
   let block: XrpBlock;
   const blockNumber = 72_387_695

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
      block = await MccClient.getBlock(blockNumber);
   });

   it("Should get block", async function () {
      expect(block).to.not.eq(undefined);
   });

   it("Should get block number ", async function () {
      expect(block.number).to.eq(blockNumber);
   });

   it("Should get block hash ", async function () {
      expect(block.blockHash).to.eq("2492B09472F24DB37B124A2F9D1D0FA6883EF0FE51494938A54E6CD93295C086");
   });

   it("Should get block standard hash ", async function () {
      expect(block.stdBlockHash).to.eq("2492B09472F24DB37B124A2F9D1D0FA6883EF0FE51494938A54E6CD93295C086");
   });

   it("Should get block timestamp ", async function () {
      expect(block.unixTimestamp).to.eq(1655418890);
   });

   it("Should get transaction ids ", async function () {
      expect(block.transactionIds.length).to.eq(42);
      // TODO at least check some txids
   });

   it("Should get transaction standard ids ", async function () {
      expect(block.stdTransactionIds.length).to.eq(42);
   });

   it("Should get transaction count ", async function () {
      expect(block.transactionCount).to.eq(42);
   });

   it("Should get block", async function () {
      const block2 = await MccClient.getBlock(blockNumber.toString());
      expect(block2).to.not.eq(undefined);
   });
});
