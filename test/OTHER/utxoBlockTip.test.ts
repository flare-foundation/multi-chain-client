import { expect } from "chai";
import { UtxoBlockTip } from "../../src";


// To be checked again!!!!!!

describe("Lite block base test ", function () {
   let block: UtxoBlockTip;
   let height = 0;

   before(async function () {
      block = new UtxoBlockTip({ hash: "2579f72f3f80f68b02767c44024d697826af787776b58", height: 0, branchlen: 0, status: "active" });
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
});
