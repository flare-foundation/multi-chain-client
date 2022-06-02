import { expect } from "chai";
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
    it.only(`Should get account transactions`,async () => {
      // const acc = 'rEVd9QP2aGsJ7wuty2qV8gqMiTiA1sX2j1'
      const acc = 'r4BhzWSGGjTeSdpcXMPoT1AbiCQm76FQGd'
      // get account transactions
      const tr = await MccClient.getAccountTransactions(acc, 71_859_000, 71_867_500)
      // const tr = await MccClient.getAccountTransactions(acc)
      
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

  describe('step by step account info',async () => {
    const acc = 'rD8btyHW512KmJdsQEoD9KFTMxfDbpqkkA'
    it.only(`Should get account info at the begging`,async () => {
      const info = await MccClient.getAccountInfo(acc, 28_014_551)
      const flags = processFlags(info.result.account_data.Flags);

      expect(flags.length).to.eq(0)
      expect(info.result.account_data.RegularKey).to.not.eq(SpecialAddresses.ACCOUNT_ONE);
    });

    // set by tx 996CF647C655904730759CE3919E5B4F4AB6E99046EB53DA0457F1956A52B6E3
    it.only(`Should get account info after setting default rippling`,async () => {
      const info = await MccClient.getAccountInfo(acc, 28_014_612)
      const flags = processFlags(info.result.account_data.Flags);

      console.log(info);
      

      expect(flags.length).to.eq(1)
      expect(flags.includes('lsfDefaultRipple')).to.eq(true)
      expect(info.result.account_data.RegularKey).to.not.eq(SpecialAddresses.ACCOUNT_ONE);
    });

    // set by E547D21C4F24FC313F492828730C17B442C37038393705A18C64D400D186319D
    it.only(`Should get account info after setting regular key to ACCOUNT_ONE`,async () => {
      const info = await MccClient.getAccountInfo(acc, 28_014_704)
      const flags = processFlags(info.result.account_data.Flags);

      expect(flags.length).to.eq(2)
      expect(flags.includes('lsfDefaultRipple')).to.eq(true)
      expect(info.result.account_data.RegularKey).to.eq(SpecialAddresses.ACCOUNT_ONE);
    });

    // set by CA70256B2BC1886C5B6B40DB74C3B6B385013EF6F1C66BB940B8F31CF50D1922
    it.only(`Should get account info after disabling master key`,async () => {
      const info = await MccClient.getAccountInfo(acc, 28_014_733)
      const flags = processFlags(info.result.account_data.Flags);

      console.log(info);
      console.log(flags)

      expect(flags.length).to.eq(3)
      expect(flags.includes('lsfDefaultRipple')).to.eq(true)
      expect(flags.includes('lsfDisableMaster')).to.eq(true)
      expect(info.result.account_data.RegularKey).to.eq(SpecialAddresses.ACCOUNT_ONE);
    });
  });


  

});



// testnet account
// The one rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo

