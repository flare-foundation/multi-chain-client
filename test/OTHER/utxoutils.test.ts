import { expect } from "chai";
import { BtcBlockTip, MCC, UtxoMccCreate, utxo_check_expect_block_out_of_range, utxo_check_expect_empty, utxo_ensure_data } from "../../src";

describe("UTXO utils tests ", function () {
   let mccClient: MCC.BTC;

   //    const BtcMccConnection = {
   //       url: process.env.BTC_URL || "",
   //       username: process.env.BTC_USERNAME || "",
   //       password: process.env.BTC_PASSWORD || "",
   //    } as UtxoMccCreate;

   const BtcMccConnection = {
      url: "",
      username: "",
      password: "",
   } as UtxoMccCreate;

   before(async function () {
      mccClient = new MCC.BTC(BtcMccConnection);
   });

   it("should return empty array if hash is empty", async () => {
      const res = await mccClient.recursive_block_hash("", 1);
      expect(res.length).to.be.equal(0);
   });

   it("should return empty array if hash is empty 2", async () => {
      const res = await mccClient.recursive_block_tip(new BtcBlockTip({ hash: "", height: 0, branchlen: 0, status: "active" }), 1);
      expect(res.length).to.be.equal(0);
   });

   it("should return false if no data", () => {
      const res = utxo_check_expect_empty({});
      expect(res).to.be.false;
   });

   it("should return true if error code is -5", () => {
      const res = utxo_check_expect_empty({ error: { code: -5 } });
      expect(res).to.be.true;
   });

   it("should return false if error code is not -5", () => {
      const res = utxo_check_expect_empty({ error: { code: -4 } });
      expect(res).to.be.false;
   });

   it("should return false if error does not contain 'code'", () => {
      const res = utxo_check_expect_empty({ error: { message: "no data" } });
      expect(res).to.be.false;
   });

   it("should return false if no data", () => {
      const res = utxo_check_expect_block_out_of_range({});
      expect(res).to.be.false;
   });

   it("should return false if no data", () => {
      const res = utxo_check_expect_block_out_of_range(null);
      expect(res).to.be.false;
   });

   it("should return true if error code is -8", () => {
      const res = utxo_check_expect_block_out_of_range({ error: { code: -8 } });
      expect(res).to.be.true;
   });

   it("should return true if error code is -1", () => {
      const res = utxo_check_expect_block_out_of_range({ error: { code: -1 } });
      expect(res).to.be.true;
   });

   it("should return false if error code is not -8 or -1", () => {
      const res = utxo_check_expect_block_out_of_range({ error: { code: -2 } });
      expect(res).to.be.false;
   });

   it("should return false if error does not contain 'code'", () => {
      const res = utxo_check_expect_block_out_of_range({ error: { message: "no data" } });
      expect(res).to.be.false;
   });

   it("should return error if 'error' exists", () => {
      const fn = () => {
         return utxo_ensure_data({ error: {} });
      };
      expect(fn).to.throw(Error);
   });

   it("should silently run", () => {
      utxo_ensure_data(null);
   });
});
