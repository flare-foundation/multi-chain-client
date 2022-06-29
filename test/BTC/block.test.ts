const chai = require('chai');
chai.use(require('chai-as-promised'));
import { expect } from "chai";
import { BtcBlock, MCC, UtxoMccCreate } from "../../src";


const BtcMccConnection = {
   //url: "123" ,
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Block Btc base test ", function () {
   let MccClient: MCC.BTC;
   let block: BtcBlock;
   const blockNumber = 729_409

   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
      block = await MccClient.getBlock(blockNumber);
   });

   it("Should get block", async function () {
      expect(block).to.not.eq(undefined);
   });

   it("Should get block number ", async function () {
      expect(block.number).to.eq(blockNumber);
   });

   it("Should get block hash ", async function () {
      expect(block.blockHash).to.eq("00000000000000000002579f72f3f80f68b02767c44024d697826af787776b58");
   });

   it("Should get block standard hash ", async function () {
      expect(block.stdBlockHash).to.eq("00000000000000000002579f72f3f80f68b02767c44024d697826af787776b58");
   });

   it("Should get block timestamp ", async function () {
      expect(block.unixTimestamp).to.eq(1648480352);
   });

   it("Should get transaction ids ", async function () {
      expect(block.transactionIds.length).to.eq(565);
      // TODO at least check some txids
   });

   it("Should get transaction standard ids ", async function () {
      expect(block.stdTransactionIds.length).to.eq(565);
   });

   it("Should get transaction count ", async function () {
      expect(block.transactionCount).to.eq(565);
   });

   it("Should not get block if invalid input", async () => {
      await expect(MccClient.getBlock(blockNumber.toString())).to.eventually.be.rejected; 
   });

});
