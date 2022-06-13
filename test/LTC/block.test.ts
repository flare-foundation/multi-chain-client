import { MCC, UtxoBlock, UtxoMccCreate } from "../../src";

const LtcMccConnection = {
   url: process.env.LTC_URL || "",
   username: process.env.LTC_USERNAME || "",
   password: process.env.LTC_PASSWORD || "",
} as UtxoMccCreate;

describe("Block LTC base test ", function () {
   let MccClient: MCC.LTC;
   let block: UtxoBlock;
   before(async function () {
      MccClient = new MCC.LTC(LtcMccConnection);
      let tblock = await MccClient.getBlock(2_220_000);
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

   // it("Should get transaction count ", async function () {
   //     // console.log(block.data);
   // });
});
