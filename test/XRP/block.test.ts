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
      expect(block.stdTransactionIds).contains("B84F30266D6297E9E4EFB7B0600E486ECD653587FFE001B05CAE5533CEF1C5BE");
      expect(block.stdTransactionIds).contains("DB91A3AECACC060EFA45B1922E278DEB5B7F5B4FC4FED5829072B66A1DFF31E1");
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
