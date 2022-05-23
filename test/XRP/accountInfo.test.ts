import { MCC, SpecialAddresses } from "../../src";
import { processFlags, processFlagsOld1, processFlagsOld2 } from "../../src/utils/xrpUtils";

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
       const acc = 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn'
       const info = await MccClient.getAccountInfo(acc)
       console.log(info);

       // Get the flags
       const flags = processFlags(info.result.account_data.Flags);
       console.log(flags);
     });
   });

   describe('account transactions',async () => {
    it(`Should get account transactions`,async () => {
      const acc = 'rEVd9QP2aGsJ7wuty2qV8gqMiTiA1sX2j1'
      // get account transactions
      // const tr = await MccClient.getAccountTransactions(acc, 71_844_000, 71_844_445)
      const tr = await MccClient.getAccountTransactions(acc)
      
      console.log(tr);
      console.log(tr.result.transactions.length);
      
      
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
     MccClient = new MCC.XRP(XRPMccConnectionTest);
     console.log(await MccClient.isHealthy());
  });

  describe('account info',async () => {
    it(`Should get account info`,async () => {
      const info = await MccClient.getAccountInfo('rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo')
      console.log(info);

      // Get the flags

      console.time('Flag new1')
      const flags = processFlags(info.result.account_data.Flags);
      console.timeEnd('Flag new1')

      console.time('Flag old1')
      const oldFlags = processFlagsOld1(info.result.account_data.Flags);
      console.timeEnd('Flag old1')

      console.time('Flag old2')
      const fastFlags = processFlagsOld2(info.result.account_data.Flags);
      console.timeEnd('Flag old2')

      console.log(flags);
      console.log(oldFlags);
      console.log(fastFlags);
      
      
      

      console.log(info.result.account_data.RegularKey);
      console.log(info.result.account_data.RegularKey === SpecialAddresses.ACCOUNT_ONE);
      

    });
  });

});



// testnet account
// The one rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo

