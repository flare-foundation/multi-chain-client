// import { assert } from "chai";
// import { AlgoBlock, AlgoIndexerBlock, MCC } from "../../src";

// const algoCreateConfig = {
//    algod: {
//       url: process.env.ALGO_ALGOD_URL || "",
//       token: process.env.ALGO_ALGOD_TOKEN || "",
//    },
//    indexer: {
//       url: process.env.ALGO_INDEXER_URL || "",
//       token: process.env.ALGO_INDEXER_TOKEN || "",
//    },
// };

// const hei = 21_374_440;

// describe(`Algo block from algod and indexer compare`, async () => {
//    describe(`Compare block from indexer and algod ${hei}`, function () {
//       let MccClient: MCC.ALGO;
//       let block: AlgoBlock;
//       let IBlock: AlgoIndexerBlock;

//       before(async function () {
//          MccClient = new MCC.ALGO(algoCreateConfig);
//          //  const currHeight = await MccClient.getBlockHeight();
//          //  console.log(currHeight);
//          let Itblock = await MccClient.getIndexerBlock(hei);

//          if (Itblock !== null) {
//             IBlock = Itblock;
//          }
//          let tblock = await MccClient.getBlock(hei);
//          if (tblock !== null) {
//             block = tblock;
//          }
//       });

//       it("Should compare block number ", async function () {
//          console.log(block.number);
//          console.log(IBlock.number);
//          console.log(block.number === IBlock.number);
//       });

//       it("Should compare block hash ", async function () {
//          console.log(block.blockHash);
//          console.log(IBlock.blockHash);
//          console.log(block.blockHash === IBlock.blockHash);
//       });

//       it("Should compare block standard hash ", async function () {
//          console.log(block.stdBlockHash);
//          console.log(IBlock.stdBlockHash);
//          console.log(block.stdBlockHash === IBlock.stdBlockHash);
//       });

//       it("Should compare block timestamp ", async function () {
//          console.log(block.unixTimestamp);
//          console.log(IBlock.unixTimestamp);
//          console.log(block.unixTimestamp === IBlock.unixTimestamp);
//       });

//       it("Should compare transaction ids ", async function () {
//          const trans1 = block.transactionIds.sort();
//          const trans2 = IBlock.transactionIds.sort();
//          console.log(trans1.length === trans2.length);
//          let allSame = true;
//          for (let i = 0; i < trans1.length; i++) {
//             if (trans1[i] === trans2[i]) {
//             } else {
//                console.log(trans1[i], trans2[i]);
//                allSame = false;
//             }
//          }
//          console.log("allsame", allSame);
//       });

//       it("Should compare transaction standard ids ", async function () {
//          const trans1 = block.stdTransactionIds.sort();
//          const trans2 = IBlock.stdTransactionIds.sort();
//          console.log(trans1.length === trans2.length);
//          let allSame = true;
//          for (let i = 0; i < trans1.length; i++) {
//             if (trans1[i] === trans2[i]) {
//             } else {
//                console.log(trans1[i], trans2[i]);
//                allSame = false;
//             }
//          }
//          console.log("allsame", allSame);
//       });

//       it("Should compare transaction count ", async function () {
//          console.log(block.transactionCount);
//          console.log(IBlock.transactionCount);
//          console.log(block.transactionCount === IBlock.transactionCount);
//       });
//    });
// });
