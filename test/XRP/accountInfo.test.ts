import { expect } from "chai";
import { MCC, SpecialAddresses } from "../../src";
import { mccSettings } from "../../src/global-settings/globalSettings";
import { processFlags } from "../../src/utils/xrpUtils";
const chai = require("chai");
chai.use(require("chai-as-promised"));

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
};

describe("Xrpl account test mainnet ", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnection);
      mccSettings.setLoggingCallback = () => {
         return;
      };
   });

   describe("account info", async () => {
      it(`Should get account info`, async () => {
         const acc = "rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn";
         const info = await MccClient.getAccountInfo(acc);
         // Get the flags
         const flags = processFlags(info.result.account_data.Flags);
         expect(flags.length).to.eq(1);
         expect(flags[0]).to.eq("lsfDisableMaster");
      });

      it(`Should get account info 2 `, async () => {
         const acc = "rMv1dFonUTJo4qeQDmmCuz3cXPsxy9AiHz";
         const info = await MccClient.getAccountInfo(acc);
         // Get the flags
         const flags = processFlags(info.result.account_data.Flags);
         expect(flags.length).to.eq(0);
         // get account founding transaction (account create)
         const fTx = "5439BB6872644CE74A09F4654CECFC5F443E9687AD5EF6D119E729898F41A8C5";
         const trans = await MccClient.getTransaction(fTx);
         expect(trans.isAccountCreate).to.eq(true);
      });

      it(`Should not get account info - invalid upper bound`, async () => {
         const acc = "rMv1dFonUTJo4qeQDmmCuz3cXPsxy9AiHz";
         await expect(MccClient.getAccountInfo(acc, "28_014_733")).to.eventually.be.rejected;
      });

      it(`Should get account info 3 `, async () => {
         const acc = "rMv1dFonUTJo4qeQDmmCuz3cXPsxy9AiHz";
         const info = await MccClient.getAccountInfo(acc);
         // Get the flags
         const flags = processFlags(info.result.account_data.Flags);
         expect(flags.length).to.eq(0);
         // get account founding transaction (account create)
         const fTx = "5439BB6872644CE74A09F4654CECFC5F443E9687AD5EF6D119E729898F41A8C5";
         const trans = await MccClient.getTransaction(fTx, { binary: true, min_block: 1, max_block: 2 });
         expect(trans.isAccountCreate).to.eq(false);
      });
   });

   describe("account transactions", async () => {
      it(`Should get account transactions`, async () => {
         const acc = "r4BhzWSGGjTeSdpcXMPoT1AbiCQm76FQGd";
         // get account transactions
         const tr = await MccClient.getAccountTransactions(acc, 71_859_000, 71_867_500);
         expect(tr.result.transactions.length).to.eq(73);
      });
      it(`Should get account transactions`, async () => {
         const acc = "r4BhzWSGGjTeSdpcXMPoT1AbiCQm76FQGd";
         // get account transactions
         const tr = await MccClient.getAccountTransactions(acc);
         expect(tr.result.account).to.equal("r4BhzWSGGjTeSdpcXMPoT1AbiCQm76FQGd");
      });
   });
});

const XRPMccConnectionTest = {
   url: process.env.XRP_URL_TESTNET || "",
   username: process.env.XRP_USERNAME_TESTNET || "",
   password: process.env.XRP_PASSWORD_TESTNET || "",
};

describe("Xrpl account test testnet ", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      MccClient = new MCC.XRP(XRPMccConnectionTest);
   });

   describe("account info", async () => {
      it(`Should get account info`, async () => {
         const info = await MccClient.getAccountInfo("rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo");
         // Get the flags
         const flags = processFlags(info.result.account_data.Flags);
         expect(flags.length).to.eq(3);
         // Regular key
         expect(info.result.account_data.RegularKey).to.eq(SpecialAddresses.ACCOUNT_ONE);

         // Multisig check
         // TODO ripple has a problem here?
         // @ts-ignore
         if (info.result.account_data?.signer_lists) {
            // @ts-ignore
            expect(info.result.account_data?.signer_lists.length).to.eq(0);
         }
      });
   });

   // Testnet gets reset sometimes
   describe("step by step account info", async () => {
      const acc = "rD8btyHW512KmJdsQEoD9KFTMxfDbpqkkA"; // my acc
      it.skip(`Should get account info at the begging`, async () => {
         const info = await MccClient.getAccountInfo(acc, 28_014_551);
         const flags = processFlags(info.result.account_data.Flags);

         expect(flags.length).to.eq(0);
         expect(info.result.account_data.RegularKey).to.not.eq(SpecialAddresses.ACCOUNT_ONE);
      });

      // set by tx 996CF647C655904730759CE3919E5B4F4AB6E99046EB53DA0457F1956A52B6E3
      it.skip(`Should get account info after setting default rippling`, async () => {
         const info = await MccClient.getAccountInfo(acc, 28_014_612);
         const flags = processFlags(info.result.account_data.Flags);

         expect(flags.length).to.eq(1);
         expect(flags.includes("lsfDefaultRipple")).to.eq(true);
         expect(info.result.account_data.RegularKey).to.not.eq(SpecialAddresses.ACCOUNT_ONE);
      });

      // set by E547D21C4F24FC313F492828730C17B442C37038393705A18C64D400D186319D
      it.skip(`Should get account info after setting regular key to ACCOUNT_ONE`, async () => {
         const info = await MccClient.getAccountInfo(acc, 28_014_704);
         const flags = processFlags(info.result.account_data.Flags);

         expect(flags.length).to.eq(2);
         expect(flags.includes("lsfDefaultRipple")).to.eq(true);
         expect(info.result.account_data.RegularKey).to.eq(SpecialAddresses.ACCOUNT_ONE);
      });

      // set by CA70256B2BC1886C5B6B40DB74C3B6B385013EF6F1C66BB940B8F31CF50D1922
      it.skip(`Should get account info after disabling master key`, async () => {
         const info = await MccClient.getAccountInfo(acc, 28_014_733);
         const flags = processFlags(info.result.account_data.Flags);

         expect(flags.length).to.eq(3);
         expect(flags.includes("lsfDefaultRipple")).to.eq(true);
         expect(flags.includes("lsfDisableMaster")).to.eq(true);
         expect(info.result.account_data.RegularKey).to.eq(SpecialAddresses.ACCOUNT_ONE);
      });
   });
});

// testnet account
// The one rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo

// my rD8btyHW512KmJdsQEoD9KFTMxfDbpqkkA
