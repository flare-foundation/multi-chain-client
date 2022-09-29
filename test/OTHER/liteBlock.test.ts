import { LiteBlock } from "../../src/base-objects/blocks/LiteBlock";
import { expect } from "chai";
import { IGetLiteBlockRes } from "../../src";
import { mccErrorCode } from "../../src/utils/errors";

// To be checked again!!!!!!

describe("Lite block base test ", function () {
   let block: LiteBlock;
   let height = 0;

   before(async function () {
      block = new LiteBlock({ hash: "2579f72f3f80f68b02767c44024d697826af787776b58", number: 0, branchlen: 0, status: 'active'});
   });

   it("Should get block", async function () {
      expect(block).to.not.be.eq(undefined);
   });

   it("Should get block number ", async function () {
      expect(block.number).to.eq(height);
   });

   it("Should get block hash ", async function () {
      expect(block.blockHash).to.eq("2579f72f3f80f68b02767c44024d697826af787776b58");
   });

   it("Should get block standard hash ", async function () {
      expect(block.stdBlockHash).to.eq("2579f72f3f80f68b02767c44024d697826af787776b58");
   });

   it("Should get block timestamp ", async function () {
      expect(block.unixTimestamp).to.eq(0);
   });

   it("Should get transaction ids ", async function () {
      expect(block.transactionIds.length).to.eq(0);
   });

   it("Should get transaction standard ids ", async function () {
      expect(block.stdTransactionIds.length).to.eq(0);
   });

   it("Should get transaction count ", async function () {
      expect(block.transactionCount).to.eq(0);
   });

   it("Should get previousBlockHash undefined ", async function () {
      expect(block.previousBlockHash).to.throw('InvalidMethodCall');
   });
   it("Should get stdPreviousBlockHash undefined ", async function () {
      expect(block.stdPreviousBlockHash).to.throw('InvalidMethodCall');
   });
});
