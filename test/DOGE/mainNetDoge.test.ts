import { MCC, traceManager, UtxoMccCreate } from "../../src";

const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))

const DogeMccConnection = {
   url: process.env.DOGE_URL || "",
   username: process.env.DOGE_USERNAME || "",
   password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

describe("DOGE mainnet client tests", () => {
   describe("get transaction tests", function () {
      it("should get transaction ", async function () {
         traceManager.displayStateOnException=false
         
         const RPC = new MCC.DOGE(DogeMccConnection);
         const txid = "2d906dbce50eb47567d1decae6a0ce5267eaabe56838ea9fd700a732bbcdcb3b";
         let trans = await RPC.getTransaction(txid);
         if (trans) {
            expect(trans.hash).to.eq(txid);
         }
         // console.log(trans);
      });

      it("should return null if transaction does not exist ", async function () {
         const RPC = new MCC.DOGE(DogeMccConnection);
         const txid = "2d906dbce50eb47567d1decae6a0ce5267eaabe56838ea9fd700a732bbcdcbff";
         let trans = RPC.getTransaction(txid);
         await expect( trans ).to.be.rejectedWith("InvalidTransaction");
      });

      it("should be able to get block height ", async function () {
         const RPC = new MCC.DOGE(DogeMccConnection);
         let blockHeight = await RPC.getBlockHeight();
         expect(blockHeight).to.be.above(0);
      });

      it("should be able to get block height ", async function () {
         const RPC = new MCC.DOGE(DogeMccConnection);
         let blockHeight = await RPC.getBlockHeight();
         expect(blockHeight).to.be.above(0);
      });

      it("should be able to get block header from height ", async function () {
         const RPC = new MCC.DOGE(DogeMccConnection);
         const height = 4103881;
         let blockHeader = await RPC.getBlockHeader(height);
         expect(blockHeader).to.not.eq(null);
      });

      it("should be able to get block header from hash ", async function () {
         const RPC = new MCC.DOGE(DogeMccConnection);
         const hash = "8ea32399901c056e32c0fef84208bc257824f6718a6d4906ab00833b8d87ea89";
         let blockHeader = await RPC.getBlockHeader(hash);
         expect(blockHeader).to.not.eq(null);
      });

      it("should be able to get block from height ", async function () {
         const RPC = new MCC.DOGE(DogeMccConnection);
         const height = 4103881;
         let blockHeader = await RPC.getBlock(height);
         expect(blockHeader).to.not.eq(null);
      });

      it("should be able to get block from hash ", async function () {
         const RPC = new MCC.DOGE(DogeMccConnection);
         const hash = "8ea32399901c056e32c0fef84208bc257824f6718a6d4906ab00833b8d87ea89";
         let blockHeader = await RPC.getBlock(hash);
         expect(blockHeader).to.not.eq(null);
      });

      it("should get full transaction ", async function () {
         const RPC = new MCC.DOGE(DogeMccConnection);
         const txid = "2d906dbce50eb47567d1decae6a0ce5267eaabe56838ea9fd700a732bbcdcb3b";
         let trans = await RPC.getTransaction(txid);
         // console.log(trans);
         if (trans) {
            expect(trans.hash).to.eq(txid);
         }
      });
   });

   describe("Doge ChainTips", async function () {
      it("basic chaintips ", async function () {
         const BtcRpc = new MCC.DOGE(DogeMccConnection);
         const chaintips = await BtcRpc.getTopBlocks();
         expect(chaintips.length).to.greaterThanOrEqual(192);
      });

      it("full chaintips with all blocks ", async function () {
         const BtcRpc = new MCC.DOGE(DogeMccConnection);
         const chaintips = await BtcRpc.getTopBlocks({ all_blocks: true });
         expect(chaintips.length).to.greaterThanOrEqual(192);
      });

      it("chaintips after block 4_133_821 ", async function () {
         const BtcRpc = new MCC.DOGE(DogeMccConnection);
         const chaintips = await BtcRpc.getTopBlocks({ height_gte: 4_133_821 });
         expect(chaintips.length).to.greaterThanOrEqual(160);
      });
   });
});
