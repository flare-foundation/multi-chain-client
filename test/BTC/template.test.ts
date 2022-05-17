import { MCC, UtxoBlock, UtxoMccCreate } from "../../src";

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

   it("Should temp test ", async function () {
      const trans = await MccClient.getTransaction('a8e7ec78e5ee9589a93b937ac2f2c34a46b94571faeb8a52e8ca85c9c7b09d02');
      console.log(trans);

      console.log("Augment");
      

      if(trans){
        const newTrans = await trans.paymentSummary(MccClient,1,1,true)
        console.log(newTrans);
      }
      
   });

});







