import { BlockBase, IBlock, IUtxoGetBlockRes, MCC, UtxoBlock, UtxoMccCreate } from "../../src";

const BtcMccConnection = {
   url: process.env.BTC_URL || '',
   username: process.env.BTC_USERNAME || '',
   password: process.env.BTC_PASSWORD || '',
} as UtxoMccCreate;

describe("Chain tips test ", function () {
   let MccClient: MCC.BTC;
   let block: UtxoBlock;
   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   it("Should get only latest tips ", async function () {
      const tips = await MccClient.getBlockTips(730_698);
      console.log(tips);
   });

   it("Should get tips and all blocks to certain height ", async function () {
      const tips = await MccClient.getTopLiteBlocks(5);
      console.log(tips);
   });
});
