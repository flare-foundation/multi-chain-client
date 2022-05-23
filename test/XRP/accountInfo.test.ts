import { MCC, XrpTransaction } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || '',
   username: process.env.XRP_USERNAME || '',
   password: process.env.XRP_PASSWORD || '',
};

describe("Xrpl account test ", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
      console.log(MccClient.isHealthy());
   });

   describe('account info',async () => {
     it(`Should get account info`,async () => {
       const info = await MccClient.getAccountInfo('rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn')
       console.log(info);
       
     });
   });

});




// testnet account
// The one rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo

