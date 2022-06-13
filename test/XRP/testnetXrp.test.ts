import { expect } from "chai";
import { LedgerResponse } from "xrpl";
import { MCC } from "../../src";

const XRPMccConnection = {
   url: process.env.XRP_URL || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
};

describe("XRP testnet client tests", () => {
   let client: MCC.XRP;

   before(function () {
      client = new MCC.XRP(XRPMccConnection);
   });

   describe("Should be able to get block height", async () => {
      it(`Should be able to get block height `, async () => {
         let height = await client.getBlockHeight();
         console.log(height);
         expect(height).to.be.greaterThan(70_000_000);
      });
   });

   describe("Basic functionalities", function () {
      it("Should return block if exists", async () => {
         let n = 69453782;
         let block = await client.getBlock(n);
         if (block) {
            expect(block.number).to.equal(n);
         }
         // assert(block.result.ledger_index === n);
      });

      it("Should return null if block does not exist", async () => {
         let n = 694537820;
         let block = await client.getBlock(n);
         expect(block).to.equal(null);
         // assert(block == null);
         n *= 100;
         block = await client.getBlock(n);
         expect(block).to.equal(null);
         // assert(block == null);
      });

      it("Should return transaction if exists", async () => {
         let txResponse = await client.getTransaction("0569969AFDAF91BFCFF709D49FE23DD5656335AFD0A3879C03C8EFADEF83A0C2");
         expect(txResponse).to.not.equal(null);
         // assert(txResponse?.result?.Account)
      });

      it("Should return null if transaction does not exist", async () => {
         let txResponse = await client.getTransaction("0669969AFDAF91BFCFF709D49FE23DD5656335AFD0A3879C03C8EFADEF83A0C2");
         expect(txResponse).to.equal(null);
         // assert(txResponse == null);
      });
   });
});
