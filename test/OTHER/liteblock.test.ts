import { MCC, UtxoMccCreate } from "../../src";
import { LiteBlock } from "../../src/base-objects/blocks/LiteBlock";

const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

const BtcMccConnection = {
   //url: "123" ,
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Lite block base test ", function () {
   let MccClient: MCC.BTC;
   let block: LiteBlock;
   let height = 0;

   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
      height = await MccClient.getBlockHeight();
      const blocs = await MccClient.getTopLiteBlocks(1);
      block = blocs[0];
   });

   after(async function () {
      // traceManager.showTrace(true,false,true,false);
      // traceManager.showMethods();
   });

   it("Should get block", async function () {
      expect(block).to.not.eq(undefined);
   });

   it("Should get block number ", async function () {
      expect(block.number).to.eq(height);
   });

   it("Should get block hash ", async function () {
      expect(block.blockHash).to.not.eq("00000000000000000002579f72f3f80f68b02767c44024d697826af787776b58");
   });

   it("Should get block standard hash ", async function () {
      expect(block.stdBlockHash).to.not.eq("00000000000000000002579f72f3f80f68b02767c44024d697826af787776b58");
   });

   it("Should get block timestamp ", async function () {
      expect(block.unixTimestamp).to.eq(0);
   });

   it("Should get transaction ids ", async function () {
      expect(function () {
         block.transactionIds;
      }).to.throw("OutsideError");
   });

   it("Should get transaction standard ids ", async function () {
      expect(function () {
         block.stdTransactionIds;
      }).to.throw("OutsideError");
   });

   it("Should get transaction count ", async function () {
      expect(function () {
         block.transactionCount;
      }).to.throw("OutsideError");
   });
});
