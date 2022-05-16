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

   it("Should get only latest tips ", async function () {
      const trans = await MccClient.getTransaction('01796c39e26365b3f9d787b803760471295452b1aaf25f7cfc1ab630630b29d5');
      console.log(trans);
      if(trans){
        const newTrans = await trans.paymentSummary(MccClient,0,0,true)
        console.log(newTrans);
      }
      
   });

});







