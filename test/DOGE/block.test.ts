import { expect } from "chai";
import { BlockBase, IBlock, IUtxoGetBlockRes, MCC, UtxoBlock, UtxoMccCreate } from "../../src";

const DogeMccConnection = {
   url: process.env.DOGE_URL || "",
   username: process.env.DOGE_USERNAME || "",
   password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

describe("Block DOGE base test ", function () {
   let MccClient: MCC.DOGE;
   let block: UtxoBlock;
   const blockHush = "e36e336dbf7854b80d48e34ff62390b34ba18e604bdfd0c5b2bd4b61580aa8c4";

   before(async function () {
      MccClient = new MCC.DOGE(DogeMccConnection);
      block = await MccClient.getBlock(blockHush);
   });

   it("Should get block", async function () {
      expect(block).to.not.eq(undefined);
   });

   it("Should get block number ", async function () {
      expect(block.number).to.eq(4151820);
   });

   it("Should get block hash ", async function () {
      expect(block.blockHash).to.eq(blockHush);
   });

   it("Should get block standard hash ", async function () {
      expect(block.stdBlockHash).to.eq(blockHush);
   });

   it("Should get block timestamp ", async function () {
      expect(block.unixTimestamp).to.eq(1647901396);
   });

   it("Should get transaction ids ", async function () {
      expect(block.transactionIds.length).to.eq(26);
      // TODO at least check some txids
   });

   it("Should get transaction standard ids ", async function () {
      expect(block.stdTransactionIds.length).to.eq(26);
   });

   it("Should get transaction count ", async function () {
      expect(block.transactionCount).to.eq(26);
   });
});
