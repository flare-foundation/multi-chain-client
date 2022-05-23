import { MCC, XrpTransaction } from "../../src";
import { processFlags } from "../../src/utils/xrpUtils";

const XRPMccConnection = {
   url: process.env.XRP_URL || '',
   username: process.env.XRP_USERNAME || '',
   password: process.env.XRP_PASSWORD || '',
};

describe("Xrpl account test mainnet ", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
      console.log(await MccClient.isHealthy());
   });

   describe('account info',async () => {
     it(`Should get account info`,async () => {
       const info = await MccClient.getAccountInfo('rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn')
       console.log(info);

       // Get the flags
       const flags = processFlags(info.result.account_data.Flags);
       console.log(flags);
       
     });
   });

});


const XRPMccConnectionTest = {
  url: process.env.XRP_URL_TESTNET || '',
  username: process.env.XRP_USERNAME_TESTNET || '',
  password: process.env.XRP_PASSWORD_TESTNET || '',
};

describe("Xrpl account test testnet ", function () {
  let MccClient: MCC.XRP;

  before(async function () {
    console.log(XRPMccConnectionTest);
    
     MccClient = new MCC.XRP(XRPMccConnectionTest);
     console.log(await MccClient.isHealthy());
  });

  describe('account info',async () => {
    it(`Should get account info`,async () => {
      const info = await MccClient.getAccountInfo('rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo')
      console.log(info);

      // Get the flags
      const flags = processFlags(info.result.account_data.Flags);
      console.log(flags);
      
    });
  });

});


// testnet account
// The one rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo

