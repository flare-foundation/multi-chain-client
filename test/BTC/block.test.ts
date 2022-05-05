import { MCC, UtxoBlock, UtxoMccCreate } from "../../src";

const BtcMccConnection = {
   url: process.env.BTC_URL || '',
   username: process.env.BTC_USERNAME || '',
   password: process.env.BTC_PASSWORD || '',
} as UtxoMccCreate;

describe("Block Btc base test ", function () {
   let MccClient: MCC.BTC;
   let block: UtxoBlock;
   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
      let tblock = await MccClient.getBlock(729409);
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
   //    //  console.log(block.data.tx![1]);
   //    const ind = block.data.tx!.slice(1).findIndex((el) => el.hash != el.txid);
   //    console.log(ind);
   //    console.log(block.data.tx![ind + 1]);
   // });
});
