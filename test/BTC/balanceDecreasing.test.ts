import { expect } from "chai";
import { BalanceDecreasingSummaryStatus, MCC, PaymentSummaryStatus, UtxoMccCreate, ZERO_BYTES_32, standardAddressHash, toHex, toHex32Bytes } from "../../src";

const BtcMccConnection = {
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe("Chain tips test ", function () {
   let MccClient: MCC.BTC;
   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   it("Should detect balance decreasing for 8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684", async function () {
      const transaction = await MccClient.getTransaction("8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684");
      const dec = await transaction.balanceDecreasingSummary({
         sourceAddressIndicator: toHex32Bytes(0),
         client: MccClient,
      });
      // console.dir(dec, { depth: null });
      expect(dec.status).to.eq(BalanceDecreasingSummaryStatus.Success);
      if (dec.response) {
         const decRes = dec.response;
         expect(decRes.blockTimestamp).to.eq(1404107109);
         expect(decRes.transactionHash).to.eq("8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684");
         expect(decRes.sourceAddressHash).to.eq(standardAddressHash("1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg"));
         expect(decRes.sourceAddress).to.eq("1HnhWpkMHMjgt167kvgcPyurMmsCQ2WPgg");
         expect(decRes.spentAmount.toString()).to.eq("220000");
         expect(decRes.isFull).to.eq(false);
         expect(decRes.paymentReference).to.eq(ZERO_BYTES_32);
      }
   });

   it("Should detect balance decreasing for 5e245d1c690b9a5686414b3c486500c6bd1ddbc6a37eb70be2cf81639b39c1d4", async function () {
      const transaction = await MccClient.getTransaction("5e245d1c690b9a5686414b3c486500c6bd1ddbc6a37eb70be2cf81639b39c1d4");
      const dec = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: toHex32Bytes(2), client: MccClient });
      // console.dir(dec, { depth: null });
      expect(dec.status).to.eq(BalanceDecreasingSummaryStatus.Success);
      if (dec.response) {
         const decRes = dec.response;
         expect(decRes.blockTimestamp).to.eq(1682056438);
         expect(decRes.transactionHash).to.eq("5e245d1c690b9a5686414b3c486500c6bd1ddbc6a37eb70be2cf81639b39c1d4");
         expect(decRes.sourceAddressHash).to.eq(standardAddressHash("1Lm4XEmHNsNCeKdPS7bc4RGHdAAtBjBjtF"));
         expect(decRes.sourceAddress).to.eq("1Lm4XEmHNsNCeKdPS7bc4RGHdAAtBjBjtF");
         expect(decRes.spentAmount.toString()).to.eq("3526751");
         expect(decRes.isFull).to.eq(false);
         expect(decRes.paymentReference).to.eq(ZERO_BYTES_32);
      }
   });

   it("Should detect balance decreasing for 64238c5599bf0bda690db001172a9e142e8b2b9a542e747570c191788a585d1e", async function () {
      const transaction = await MccClient.getTransaction("64238c5599bf0bda690db001172a9e142e8b2b9a542e747570c191788a585d1e");
      const dec = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: toHex32Bytes(0), client: MccClient });
      // console.dir(dec, { depth: null });
      expect(dec.status).to.eq(BalanceDecreasingSummaryStatus.Success);
      if (dec.response) {
         const decRes = dec.response;
         expect(decRes.blockTimestamp).to.eq(1682063799);
         expect(decRes.transactionHash).to.eq("64238c5599bf0bda690db001172a9e142e8b2b9a542e747570c191788a585d1e");
         expect(decRes.sourceAddressHash).to.eq(standardAddressHash("bc1q32sxnq5hecdurfzgzp5x0zh8du86v9x84wdqdx"));
         expect(decRes.sourceAddress).to.eq("bc1q32sxnq5hecdurfzgzp5x0zh8du86v9x84wdqdx");
         expect(decRes.spentAmount.toString()).to.eq("3388240291");
         expect(decRes.isFull).to.eq(false);
         expect(decRes.paymentReference).to.eq(ZERO_BYTES_32);
      }
   });

   it("Should detect balance decreasing for 2765f45b93095878a5b48f6726b13d622a7f6135aafdc34e88d05865cd60e68c", async function () {
      const transaction = await MccClient.getTransaction("2765f45b93095878a5b48f6726b13d622a7f6135aafdc34e88d05865cd60e68c");
      const dec = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: toHex32Bytes(2), client: MccClient });
      expect(dec.status).to.eq(BalanceDecreasingSummaryStatus.NoSourceAddress);
   });

   it("Should detect balance decreasing for 2765f45b93095878a5b48f6726b13d622a7f6135aafdc34e88d05865cd60e68c", async function () {
      const transaction = await MccClient.getTransaction("2765f45b93095878a5b48f6726b13d622a7f6135aafdc34e88d05865cd60e68c");
      const dec = await transaction.balanceDecreasingSummary({ sourceAddressIndicator: "0x", client: MccClient });
      expect(dec.status).to.eq(BalanceDecreasingSummaryStatus.NotValidSourceAddressFormat);
   });
});
