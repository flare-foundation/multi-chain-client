import { MCC, XrpBlock } from "../../src";
import { getTestFile } from "../testUtils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
const expect = chai.expect;
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe(`Block Xrp base test (${getTestFile(__filename)})`, function () {
   let MccClient: MCC.XRP;
   let block: XrpBlock;
   const blockNumber = 72_387_695;
   const blockHash = "2492B09472F24DB37B124A2F9D1D0FA6883EF0FE51494938A54E6CD93295C086";

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
      block = await MccClient.getBlock(blockHash);
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

   it("Should get transaction count 2", async function () {
      delete block._data.result.ledger.transactions;
      expect(block.transactionCount).to.eq(0);
   });

   it("Should get block", async function () {
      const block2 = await MccClient.getBlock(blockHash);
      expect(block2).to.not.eq(undefined);
   });

   it("Should not get block", async function () {
      await expect(MccClient.getBlock(blockNumber.toString())).to.eventually.be.rejected;
   });

   it("Should get previousBlockHash", async function () {
      await expect(block.previousBlockHash).to.eq("D50040A5B66578B80EB8F21D071B3118C3142837E8EBFAD03F9B0960590E2C21");
   });

   it("Should get stdPreviousBlockHash", async function () {
      await expect(block.stdPreviousBlockHash).to.eq("D50040A5B66578B80EB8F21D071B3118C3142837E8EBFAD03F9B0960590E2C21");
   });

   it("Should check validity", async function () {
      await expect(block.isValid).to.eq(true);
   });
});
