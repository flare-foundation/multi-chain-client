import { expect } from "chai";
import { AlgoBlock, AlgoTransaction, MCC, ZERO_BYTES_32 } from "../../src";
import { AlgoIndexerTransaction } from "../../src/base-objects/transactions/AlgoIndexerTransaction";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

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

describe(`Algo block processing`, async () => {
   let MccClient: MCC.ALGO;
   let block1: AlgoBlock;
   let BTrans1: AlgoTransaction;
   let ITrans1: AlgoIndexerTransaction;
   let block2: AlgoBlock;
   let BTrans2: AlgoTransaction;
   let ITrans2: AlgoIndexerTransaction;
   let ITrans3: AlgoIndexerTransaction;
   let ITrans4: AlgoIndexerTransaction;

   before(async function () {
      MccClient = new MCC.ALGO(algoCreateConfig);
      const tblock = await MccClient.getBlock(21_700_000);
      if (tblock !== null) {
         block1 = tblock;
         const bttrans = block1.transactions[0];
         if (bttrans !== null) {
            BTrans1 = bttrans;
            const titrans = await MccClient.getIndexerTransaction(BTrans1.txid);
            if (titrans) {
               ITrans1 = titrans;
            }
         }
      }
      const tblock2 = await MccClient.getBlock(21_797_543);
      if (tblock2 !== null) {
         block2 = tblock2;
         const bttrans = block2.transactions[0];
         if (bttrans !== null) {
            BTrans2 = bttrans;
            const titrans = await MccClient.getIndexerTransaction(BTrans2.txid);
            if (titrans) {
               ITrans2 = titrans;
            }
         }
      }
      const titrans1 = await MccClient.getIndexerTransaction("O4PGGEM3ZCA27SQHCJH4VBTB3FYM7FJNRF2ROOGFQRI4BSYWPKLQ");
      if (titrans1) {
         ITrans3 = titrans1;
      }

      const titrans2 = await MccClient.getIndexerTransaction("TSLAKUC3THKQDGRAQVEF2I3WVMWLBYBSK2HAO5GPCMY27KRDUWNA");
      if (titrans2) {
         ITrans4 = titrans2;
      }
   });

   it("Should get type ", async function () {
      expect(ITrans1.type).to.eq("axfer");
      expect(ITrans2.type).to.eq("pay");
      expect(ITrans3.type).to.eq("axfer");
   });

   it("Should check if native payment ", async function () {
      expect(ITrans1.isNativePayment).to.be.false;
      expect(ITrans2.isNativePayment).to.be.true;
      expect(ITrans3.isNativePayment).to.be.false;
   });

   it("Should get currency name ", async function () {
      expect(ITrans1.currencyName).to.eq("27165954");
      expect(ITrans2.currencyName).to.eq("ALGO");
      expect(ITrans3.currencyName).to.eq("791265863");
   });

   it("Should get payment summary ", async function () {
      expect((await ITrans1.paymentSummary(MccClient)).isNativePayment).to.be.false;
      expect((await ITrans2.paymentSummary(MccClient)).isNativePayment).to.be.true;
   });
   it("Should get transaction receivingAddresses ", async function () {
      expect(ITrans1.receivingAddresses.length).to.eq(0);
      expect(ITrans2.receivingAddresses[0]).to.eq("XFYAYSEGQIY2J3DCGGXCPXY5FGHSVKM3V4WCNYCLKDLHB7RYDBU233QB5M");
      expect(ITrans3.receivingAddresses.length).to.eq(0);
   });

   //    Something weird wrong if on the right toBN insetad of on the left toNumber
   it("Should get transaction receivedAmounts", async function () {
      expect(ITrans1.receivedAmounts.length).to.eq(0);
      if (ITrans2.data.transaction.paymentTransaction) {
         expect(ITrans2.receivedAmounts[0].amount.toNumber()).to.eq(0);
      }
      expect(ITrans3.receivedAmounts.length).to.eq(0);
   });

   it("Should get transaction spentAmounts", async function () {
      expect(ITrans1.spentAmounts[0].amount.toNumber()).to.eq(1000);
      expect(ITrans2.spentAmounts[0].amount.toNumber()).to.eq(1000);
      expect(ITrans3.spentAmounts[0].amount.toNumber()).to.eq(1000);
   });

   it("Should get transaction id ", async function () {
      expect(ITrans1.hash).to.eq("G73S45QLTHR6X6TYO22GQ2S5WTAT3M7NJYA5LOQIOOXUGQLGK7GQ");
      expect(ITrans2.hash).to.eq("FN3NNUPRUAFDQZGZNSZL32CEAI2O4E5BBOD3GY2D4LCLOD3ANNGA");
      expect(ITrans3.hash).to.eq("O4PGGEM3ZCA27SQHCJH4VBTB3FYM7FJNRF2ROOGFQRI4BSYWPKLQ");
   });

   it("Should get transaction roundTime ", async function () {
      expect(ITrans1.unixTimestamp).to.eq(1655588264);
      expect(ITrans2.unixTimestamp).to.eq(1656011364);
   });

   //    //    it("Should get transaction note ", async function () {
   //    //       expect(ITrans1.reference).to.eql([]);
   //    //       expect(ITrans2.reference).to.eql([]);
   //    //    });

   //    ????????????????????
   it("Should get standard payment reference ", async function () {
      expect(ITrans1.stdPaymentReference).to.eq(ZERO_BYTES_32);
   });

   it("Should get transaction receivedAmounts ", async function () {
      expect(ITrans1.receivedAmounts.length).to.eq(0);
      expect(ITrans2.receivedAmounts[0].amount.toNumber()).to.eq(0);
      expect(ITrans3.receivedAmounts.length).to.eq(0);
   });

   it("Should get transaction spentAmounts ", async function () {
      expect(ITrans1.spentAmounts[0].amount.toNumber()).to.eq(ITrans1.fee.toNumber());
      expect(ITrans2.spentAmounts[0].amount.toNumber()).to.eq(ITrans2.fee.toNumber());
      expect(ITrans3.spentAmounts[0].amount.toNumber()).to.eq(ITrans3.fee.toNumber());
   });
   // ????????????????
   //    it("Should get transaction currencyName ", async function () {
   //       expect(ITrans1.currencyName).to.eq("");
   //    });

   it("Should get transaction asserReceivingAddresses ", async function () {
      expect(ITrans1.assetReceivingAddresses[0]).to.eq("3EDVPMS2OHEV3FBHVOCANZYVKE5H4RHOFJNXUYMWCCH4DGY4FXG75MWVZY");
      expect(ITrans2.assetReceivingAddresses.length).to.eq(0);
      expect(ITrans3.assetReceivingAddresses[0]).to.eq("FO2CF7U7GXHUFDUUWNOQ2RWLZGRVNMC6GA4IPEBKB6DM4PGOEDR7BMHP3U");
      expect(ITrans4.assetReceivingAddresses.length).to.eq(2);
      expect(ITrans4.assetReceivingAddresses[0]).to.eq("KRZYFYXTQ3YK5ADN4VFYFHGRLA6RGUIEO3D54LZC3MV5LKI66P3LDLPVTI");
   });

   it("Should get transaction asserSourceAddresses ", async function () {
      expect(ITrans1.assetSourceAddresses[0]).to.eq("ZW3ISEHZUHPO7OZGMKLKIIMKVICOUDRCERI454I3DB2BH52HGLSO67W754");
      expect(ITrans2.assetSourceAddresses.length).to.eq(0);
      expect(ITrans3.assetSourceAddresses[0]).to.eq("7NAM7FMTE2KUMWVDSS5AYXISMPKERQRXHNPICP257R6VKZVO4GOOFM7XIQ");
      expect(ITrans4.assetSourceAddresses.length).to.eq(1);
      expect(ITrans4.assetSourceAddresses[0]).to.eq("HVAJ7ZGKUWZOUPA3UT2SXA7U6VIK7AWWZZSJRPFBHUMNLOKUCSNYOCO76Q");
   });

   it("Should not get transaction asserSpentAmounts and asserReceivedAmounts w/out makeFull ", async function () {
      expect(() => ITrans1.assetSpentAmounts).to.throw("InvalidResponse");
      expect(() => ITrans1.assetReceivedAmounts).to.throw("InvalidResponse");
   });

   it("Should  get transaction asserSpentAmounts w/ makeFull", async function () {
      await ITrans1.makeFull(MccClient);
      await ITrans3.makeFull(MccClient);
      await ITrans4.makeFull(MccClient);
      expect(ITrans1.assetSpentAmounts[0].amount.toNumber()).to.eq(0);
      expect(ITrans2.assetSpentAmounts.length).to.eq(0);
      expect(ITrans3.assetSpentAmounts[0].amount.toNumber()).to.eq(1);
      expect(ITrans4.assetSpentAmounts[0].amount.toNumber()).to.eq(1);
   });

   it("Should  get transaction assertReceivedAmounts w/ makeFull", async function () {
      await ITrans1.makeFull(MccClient);
      expect(ITrans1.assetReceivedAmounts[0].amount.toNumber()).to.eq(0);
      expect(ITrans2.assetReceivedAmounts.length).to.eq(0);
      expect(ITrans3.assetReceivedAmounts[0].amount.toNumber()).to.eq(1);
      expect(ITrans4.assetReceivedAmounts[0].amount.toNumber()).to.eq(0);
      expect(ITrans4.assetReceivedAmounts[1].amount.toNumber()).to.eq(1);
   });

   it("Should  no get additional asset info ", async function () {
      await expect(MccClient.getIndexerAssetInfo(1)).to.be.rejectedWith("InvalidResponse");
   });

   it("Should list transactions with options", async function () {
      const res = await MccClient.listTransactions({ sigType: "sig" });
      expect(res).to.not.be.null;
   });

   it("Should get transaction", async function () {
      const res = await MccClient.getIndexerTransaction("0xULHDCNM665O7M4E44PGEJ7XB3Z7YIF7QYUWY5ZBTPO434M47SZ3Q");
      expect(res).to.not.be.null;
   });

   it("Should not get transaction ", async function () {
      await expect(MccClient.getIndexerTransaction("0xUL")).to.be.rejectedWith("InvalidBlock");
   });

   it("Should get standard payment reference 2", async function () {
      const ti = await MccClient.getIndexerTransaction("2DWIMCX2EUXG2A5PJ55DRNENT5HRHMW7CHBAMY5IWXAA7QWPDHLA");
      expect(ti?.stdPaymentReference).to.eq("0x44d5b4718d6bb8daa193c0f3ad272604dd0352ae0e6273aa93d6b2622395313b");
   });
});
