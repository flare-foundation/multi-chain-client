import { expect } from "chai";
import { ChainType, MCC, traceManager, UtxoMccCreate } from "../../src";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const BtcMccConnection = {
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
} as UtxoMccCreate;

describe("BTC mainnet client tests", () => {
   let MccClient: MCC.BTC;
   before(async function () {
      this.timeout(10000); // set timeout to 10 sec from 2 sec
      traceManager.displayStateOnException = false;
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   describe("Should initialize", function () {
      it("Direct initialize", async function () {
         const client = new MCC.BTC(BtcMccConnection);
         expect(client).to.not.eq(null);
      });

      it("Client initialize", async function () {
         const client = MCC.Client("BTC", BtcMccConnection);
         expect(client).to.not.eq(null);
      });
   });

   describe("Basic functionality ", function () {
      it("Should say it is BTC mcc client ", async function () {
         expect(MccClient.chainType).to.eq(ChainType.BTC);
      });

      it("Should get block header ", async function () {
         const blockhash = "00000000000000000009a57dd6ca3b8d18af776732364dfc17b07b5bf67c5368";
         const header = await MccClient.getBlockHeaderBase(blockhash);
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         expect(header!.hash).to.eq(blockhash);
      });

      it("Should get block header 2 ", async function () {
         const blockhash = "00000000000000000009a57dd6ca3b8d18af776732364dfc17b07b5bf67c5368";
         const header = await MccClient.getBlockHeaderBase("0x" + blockhash);
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         expect(header!.hash).to.eq(blockhash);
      });

      it("Should get null for wrong header ", async function () {
         const blockhash = "00000000000000000009a57dd6ca3b8d18af776732364dfc17b07b5bf67c53ff";
         await expect(MccClient.getBlockHeaderBase(blockhash)).to.be.rejectedWith("InvalidData");
      });

      it("Should get null from get block fow invalid data ", async function () {
         const blockhash = 1000000;
         await expect(MccClient.getBlock(blockhash)).to.be.rejectedWith("InvalidParameter");
      });
   });

   describe("OP_RETURN script", function () {
      it("should get OP_RETURN message from transaction ", async function () {
         const BtcRpc = new MCC.BTC(BtcMccConnection);
         const txid = "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684";

         const trans = await BtcRpc.getTransaction(txid);
         if (trans) {
            const reference = trans.reference;
            expect(reference.length).to.eq(1);
            expect(reference[0]).to.eq("636861726c6579206c6f766573206865696469");
         } else {
            expect(trans).to.eq(null);
         }
      });

      it("should get OP_RETURN message from transaction ", async function () {
         const BtcRpc = new MCC.BTC(BtcMccConnection);
         const txid = "4dd738c1aebb7a1e50f36100779369053fffd790acfacd0ab10dbbb587e4af01";

         const trans = await BtcRpc.getTransaction(txid);
         if (trans) {
            const reference = trans.reference;
            expect(reference.length).to.eq(1);
         } else {
            expect(trans).to.eq(null);
         }
      });

      it("should get multiple OP_RETURN message from transaction ", async function () {
         const BtcRpc = new MCC.BTC(BtcMccConnection);
         const coinbaseTx = "fbf351cd9f1a561be21e3977282e931c5209ed6b90472e225b4a674dbc643511";

         const trans = await BtcRpc.getTransaction(coinbaseTx);
         if (trans) {
            const reference = trans.reference;
            expect(reference.length).to.eq(3);
         } else {
            expect(trans).to.eq(null);
         }
      });
   });

   describe("BTC ChainTips", async function () {
      it("basic chaintips ", async function () {
         const BtcRpc = new MCC.BTC(BtcMccConnection);
         const chaintips = await BtcRpc.getTopBlocks();
         expect(chaintips.length).to.greaterThanOrEqual(3);
      });

      it("full chaintips ", async function () {
         const BtcRpc = new MCC.BTC(BtcMccConnection);
         const chaintips = await BtcRpc.getTopBlocks({ all_blocks: true });
         expect(chaintips.length).to.greaterThanOrEqual(3);
      });

      it("chaintips after ", async function () {
         const BtcRpc = new MCC.BTC(BtcMccConnection);
         const chaintips = await BtcRpc.getTopBlocks({ height_gte: 706_000 });
         expect(chaintips.length).to.greaterThanOrEqual(2);
      });

      it("chaintips after ", async function () {
         const BtcRpc = new MCC.BTC(BtcMccConnection);
         const chaintips = await BtcRpc.getTopBlocks({ height_gte: 706_000, all_blocks: true });
         expect(chaintips.length).to.greaterThanOrEqual(2);
      });

      it("All Block tips ", async function () {
         const BtcRpc = new MCC.BTC(BtcMccConnection);
         const BlockTips = await BtcRpc.getTopLiteBlocks(6);
         expect(BlockTips.length).to.greaterThanOrEqual(6);
      });
   });
});
