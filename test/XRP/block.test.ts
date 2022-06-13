import { MCC, XrpBlock } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
};

describe("Block Xrp base test ", function () {
   let MccClient: MCC.XRP;
   let block: XrpBlock;

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
      console.log(await MccClient.isHealthy());
      // let tblock = await MccClient.getBlock(70_015_100);
      let height = await MccClient.getBlockHeight();
      console.log(height);

      let tblock = await MccClient.getBlock(height - 20);

      // let tblock = await MccClient.getBlock(70_562_499);

      if (tblock !== null) {
         block = tblock;
      }
      console.log(block);
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
