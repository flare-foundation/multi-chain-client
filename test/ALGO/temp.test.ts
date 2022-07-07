import { expect } from "chai";
import { AlgoBlock, MCC, traceManager } from "../../src";

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
};

describe.skip(`Algo block processing`, async () => {
   describe("Top block", function () {
      it("Should get block", async function () {
         traceManager.displayStateOnException = false;
         const MccClient = new MCC.ALGO(algoCreateConfig);
         const block = await MccClient.getBlock();

         expect(block).to.not.eq(undefined);
      });
   });

   describe("Classic block test ", function () {
      let MccClient: MCC.ALGO;
      let block: AlgoBlock;
      const blockNumber = 21_797_543;

      before(async function () {
         MccClient = new MCC.ALGO(algoCreateConfig);
         block = await MccClient.getBlock(blockNumber);
      });

      it("Should get block", async function () {
         expect(block).to.not.eq(undefined);
      });

      it(`transactions`, async () => {
        for(let tr of block.transactions){
          console.log(tr.txid);
          
          // should be WJ6AJIDW3IBF4J6IQUIF2U6KPKCAGOEVBQ6DCFUIWHDRRGK7TDWQ
          if(tr.txid === "DIGQ2U77FTRJ46IMB2S7RWEFX635MFUIZN6X3BZMVSMU4ZUBBSXQ"){
            console.log(tr.data);
            
          }

          // const wrong = "B3EBGK2FPPZ7UY7SHP6H4TA4SO4C2NTTGM7ERHMWNZSZSFWONRJA"
        }
      });

      // it("Should get block number ", async function () {
      //    expect(block.number).to.eq(blockNumber);
      // });

      // it("Should get block hash ", async function () {
      //    expect(block.blockHash).to.eq("rWPGk6t3twBulPE4lt7Yt9IHpgeOsqU1IlGAGJ5B74g=");
      // });

      // it("Should get block hash base32 ", async function () {
      //    expect(block.blockHashBase32).to.eq("VVR4NE5LO63QA3UU6E4JNXWYW7JAPJQHR2ZKKNJCKGABRHSB56EA");
      // });

      // it("Should get block hash base64 ", async function () {
      //    expect(block.blockHashBase64).to.eq("rWPGk6t3twBulPE4lt7Yt9IHpgeOsqU1IlGAGJ5B74g=");
      // });

      // it("Should get block standard hash ", async function () {
      //    expect(block.stdBlockHash).to.eq("ad63c693ab77b7006e94f13896ded8b7d207a6078eb2a535225180189e41ef88");
      // });

      // it("Should get block timestamp ", async function () {
      //    expect(block.unixTimestamp).to.eq(1655413908);
      // });

      // it("Should get transaction ids ", async function () {
      //    expect(block.transactionIds.length).to.eq(69);
      //    // TODO at least check some txids
      // });

      // it("Should get transaction standard ids ", async function () {
      //    expect(block.stdTransactionIds.length).to.eq(69);
      // });

      // it("Should get transaction count ", async function () {
      //    expect(block.transactionCount).to.eq(69);
      // });

      // it("Should get transaction objects (ALGO SPECIFIC) ", async function () {
      //    expect(block.transactions.length).to.eq(69);
      // });
   });
});



// group hash
// 6a 41 fa c5 e2 f4 c3 60 21 05 f4 2b cc 2d 97 c1 f9 5f f4 5e fe 52 c6 de 77 fe 9c d6 3f 33 d9 5c
// 6a 41 fa c5 e2 f4 c3 60 21 05 f4 2b cc 2d 97 c1 f9 5f f4 5e fe 52 c6 de 77 fe 9c d6 3f 33 d9 5c