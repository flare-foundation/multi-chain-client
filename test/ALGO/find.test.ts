import { MCC } from "../../src";

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
};

describe(`Find some transaction`, async () => {
   let startBlock = 21_880_000;

   let MccClient: MCC.ALGO;

   before(async function () {
      MccClient = new MCC.ALGO(algoCreateConfig);
      startBlock = await MccClient.getBottomBlockHeight();
   });

   it.skip(`Find first clawback transaction`, async () => {
      let found = false;

      while (true) {
         const block = await MccClient.getBlock(startBlock);

         console.log(startBlock);

         for (let tran of block.transactions) {
            if (tran.data.asnd) {
               found = true;
            }
         }
         if (found) {
            break;
         }
         startBlock += 1;
      }
   });

   it.skip(`Find first transaction that has assetCloseTo `, async () => {
      let found = false;

      while (true) {
         const block = await MccClient.getBlock(startBlock);
         for (let tran of block.transactions) {
            if (tran.data.aclose) {
               found = true;
            }
         }
         if (found) {
            break;
         }
         startBlock += 1;
      }
   });

   it.skip(`Find first transaction base `, async () => {
    let found = false;

    while (true) {
       const block = await MccClient.getBlock(startBlock);

      //  console.log(startBlock);

       for (let tran of block.transactions) {
          if (tran.data.lsig) {
             console.log(tran.txid);
             console.log(startBlock);
             console.log(tran.data);
             
             found = true;
          }
       }

      //  if (found) {
      //     break;
      //  }
       startBlock += 1;
    }
 });
});

// wrong
// B3EBGK2FPPZ7UY7SHP6H4TA4SO4C2NTTGM7ERHMWNZSZSFWONRJA
// 21797543
