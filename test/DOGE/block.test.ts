import { BlockBase, IBlock, IUtxoGetBlockRes, MCC, UtxoBlock, UtxoMccCreate } from "../../src";

const DogeMccConnection = {
   url: process.env.DOGE_URL || "",
   username: process.env.DOGE_USERNAME || "",
   password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

describe("Block DOGE base test ", function () {
   let MccClient: MCC.DOGE;
   let block: UtxoBlock;
   before(async function () {
      MccClient = new MCC.DOGE(DogeMccConnection);
      const bHash = "e36e336dbf7854b80d48e34ff62390b34ba18e604bdfd0c5b2bd4b61580aa8c4";
      // let tblock = await MccClient.getBlock(4_151_820);
      let tblock = await MccClient.getBlock(bHash);
      if (tblock !== null) {
         block = tblock;
      }
   });

   it("Should get block number ", async function () {
      console.log(block.number);
   });

   it("Should get block hash ", async function () {
      console.log(block.blockHash);
   });

   it("Should get block standard hash ", async function () {
      console.log(block.stdBlockHash);
   });

   it("Should get block timestamp ", async function () {
      console.log(block.unixTimestamp);
   });

   it("Should get transaction ids ", async function () {
      console.log(block.transactionIds);
   });

   it("Should get transaction standard ids ", async function () {
      console.log(block.stdTransactionIds);
   });

   it("Should get transaction count ", async function () {
      console.log(block.transactionCount);
   });
});
