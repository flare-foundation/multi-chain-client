/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "chai";
import { BtcTransaction, MCC, PaymentSummaryStatus, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

const BtcMccConnection = {
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Transaction Btc test (${getTestFile(__filename)})`, function () {
   let MccClient: MCC.BTC;

   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   describe("Transaction output P2PKH ", function () {
      const txid = "0x4e662306dac0950029251473e0375fdc2811662f35a219284d98b92b1034dbaa";
      let transaction: BtcTransaction;

      before(async () => {
         transaction = await MccClient.getTransaction(txid);

         await transaction.makeFullPayment(MccClient);
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq("4e662306dac0950029251473e0375fdc2811662f35a219284d98b92b1034dbaa");
      });

      it("Should check that output at index 1 has the structure of P2PKH", async function () {
         const isP2PKH = transaction.isP2PKH(1);
         expect(isP2PKH).to.eq(true);
      });

      it("Should check that output at index 1 is a valid P2PKH", async function () {
         const isP2PKH = transaction.isValidP2PKH(1);
         expect(isP2PKH).to.eq(true);
      });
   });

   describe("Transaction output P2wPKH ", function () {
      const txid = "0x4307dbf3298e1aa0dcea54d7e3f295830c84762371cfa0a219836efc23422a70";
      let transaction: BtcTransaction;

      before(async () => {
         transaction = await MccClient.getTransaction(txid);

         await transaction.makeFullPayment(MccClient);
      });

      it("Should get transaction txid ", async function () {
         expect(transaction.txid).to.eq("4307dbf3298e1aa0dcea54d7e3f295830c84762371cfa0a219836efc23422a70");
      });

      it.skip("Should check that output at index 1 has the structure of P2WPKH", async function () {
         const isP2PKH = transaction.isP2WPKH(0);
         expect(isP2PKH).to.eq(true);
      });

      it.skip("Should check that output at index 1 is a valid P2WPKH", async function () {
         const isP2PKH = transaction.isValidP2WPKH(0);
         expect(isP2PKH).to.eq(true);
      });
   });
});
