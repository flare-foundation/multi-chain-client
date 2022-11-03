import { expect } from "chai";
import { AlgoTransaction, MCC } from "../../src";
import { AlgoIndexerTransaction } from "../../src/base-objects/transactions/AlgoIndexerTransaction";

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL || "",
      token: process.env.ALGO_ALGOD_TOKEN || "",
   },
   indexer: {
      url: process.env.ALGO_INDEXER_URL || "",
      token: process.env.ALGO_INDEXER_TOKEN || "",
   },
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

const hei = 21_374_440;

// only tests one axfer

describe(`Algo transaction from algod block VS from indexer compare`, async () => {
   describe(`Compare transactions  ${hei}`, function () {
      let MccClient: MCC.ALGO;
      let BTrans: AlgoTransaction;
      let ITrans: AlgoIndexerTransaction;

      before(async function () {
         MccClient = new MCC.ALGO(algoCreateConfig);

         const tblock = await MccClient.getBlock(hei);
         if (tblock !== null) {
            const bttrans = tblock.transactions[0];
            if (bttrans) {
               BTrans = bttrans;
               const titrans = await MccClient.getIndexerTransaction(BTrans.txid);

               if (titrans) {
                  ITrans = titrans;
               }
            }
         }
      });

      it("Should compare transaction txid ", async function () {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const asset = await MccClient.indexerClient?.get(`/v2/assets/${127745593}`);
         expect(BTrans.txid).to.eq(ITrans.txid);
      });

      it("Should compare transaction hash ", async function () {
         expect(BTrans.hash).to.eq(ITrans.hash);
      });

      it("Should compare transaction std txid ", async function () {
         expect(BTrans.stdTxid).to.eq(ITrans.stdTxid);
      });

      it("Should compare transaction reference ", async function () {
         expect(BTrans.reference.length).to.eq(ITrans.reference.length);
         ITrans.reference.sort();
         BTrans.reference.sort();
         for (let i = 0; i < BTrans.reference.length; i++) {
            expect(BTrans.reference[i]).to.eq(ITrans.reference[i]);
         }
      });

      it("Should compare transaction stdPaymentReference ", async function () {
         expect(BTrans.stdPaymentReference).to.eq(ITrans.stdPaymentReference);
      });

      it("Should compare transaction unix timestamp ", async function () {
         expect(BTrans.unixTimestamp).to.eq(ITrans.unixTimestamp);
      });
   });
});
