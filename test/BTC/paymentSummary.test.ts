import { expect } from "chai";
import { BtcTransaction, MCC, PaymentNonexistenceSummaryStatus, PaymentSummaryStatus, UtxoMccCreate, ZERO_BYTES_32 } from "../../src";
import { getTestFile } from "../testUtils";
import { execSync } from "child_process";

const BtcMccConnection = {
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
   rateLimitOptions: {
      timeoutMs: 15000,
   },
} as UtxoMccCreate;

describe(`summaries, , ${getTestFile(__filename)}`, function () {
   let MccClient: MCC.BTC;

   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   describe(`BTC payment summary`, function () {
      let transaction: BtcTransaction;
      const txid = "ed30230596b7b801391b7b1f9aba414ac925a50a8dce32988ac075ccce746545";

      before(async function () {
         MccClient = new MCC.BTC(BtcMccConnection);
         transaction = await MccClient.getTransaction(txid);
      });

      it("Should be full transaction", async function () {
         expect(transaction.type).to.eq("full_payment");
      });

      it("Should get invalid in utxo error", async function () {
         const error = await transaction.paymentSummary({
            client: MccClient,
            inUtxo: -1,
            outUtxo: 0,
         });
         expect(error).to.deep.eq({
            status: PaymentSummaryStatus.InvalidInUtxo,
         });
      });

      it("Should get invalid out utxo error", async function () {
         const error = await transaction.paymentSummary({
            client: MccClient,
            inUtxo: 0,
            outUtxo: -1,
         });
         expect(error).to.deep.eq({
            status: PaymentSummaryStatus.InvalidOutUtxo,
         });
      });
   });

   describe("BTC payment summary coinbase ", function () {
      let transaction: BtcTransaction;
      const txid = "896081dd98965cb801dde02cf6981c65ff61b923c35fe9320944fd4546b7b5bd";

      before(async function () {
         transaction = await MccClient.getTransaction(txid);
      });

      it("Should be coinbase transaction", async function () {
         expect(transaction.type).to.eq("coinbase");
      });

      it("Should get invalid in utxo error", async function () {
         const error = await transaction.paymentSummary({
            client: MccClient,
            inUtxo: 0,
            outUtxo: 0,
         });
         expect(error).to.deep.eq({
            status: PaymentSummaryStatus.Coinbase,
         });
      });
   });

   describe("BTC payment summary with op return ", function () {
      let transaction: BtcTransaction;
      const txid = "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684";

      before(async function () {
         transaction = await MccClient.getTransaction(txid);
      });

      it("Should be full transaction", async function () {
         expect(transaction.type).to.eq("full_payment");
      });

      it("Should get invalid in utxo error", async function () {
         const error = await transaction.paymentSummary({
            client: MccClient,
            inUtxo: 0,
            outUtxo: 0,
         });
         expect(error).to.deep.eq({
            status: PaymentSummaryStatus.NoReceiveAmountAddress,
         });
      });
   });
});
