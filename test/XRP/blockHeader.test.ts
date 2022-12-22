import { MCC } from "../../src";
import { expect } from "chai";
import { XrpBlockHeader } from "../../src/base-objects/blockHeaders/XrpBlockHeader";

describe("XRP blockHeader", function () {
   const XRPMccConnection = {
      url: process.env.XRP_URL || "https://xrplcluster.com",
      username: process.env.XRP_USERNAME || "",
      password: process.env.XRP_PASSWORD || "",
      apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
   };

   const client = new MCC.XRP(XRPMccConnection);

   let headerId: XrpBlockHeader;
   let headerHash: XrpBlockHeader;

   before(async function () {
      headerId = await client.getBlockHeader(76_603_195);
      headerHash = await client.getBlockHeader("07A5D3E9602BDA81741C757AB6B8D6C4377D3AD1DB298EFE8305715C9B79281D");
   });

   it("Should get headers", function () {
      expect(headerId).to.not.be.undefined;
      expect(headerHash).to.not.be.undefined;
   });

   it("Should get previousBlockHash", function () {
      const res = headerId.previousBlockHash;
      expect(res).to.eq("5DEAD5D8D9ECF952A798B3262C911463C88AE063139C2999FB2CC9CF29E54BCF");
   });

   it("Should get stdPreviousBlockHash", function () {
      const res = headerId.stdPreviousBlockHash;
      expect(res).to.eq("5DEAD5D8D9ECF952A798B3262C911463C88AE063139C2999FB2CC9CF29E54BCF");
   });

   it("Should get transactionCount", function () {
      const res = headerId.transactionCount;
      expect(res).to.eq(49);
   });

   it("Should get block number", function () {
      const res = headerId.number;
      expect(res).to.eq(76_603_195);
   });

   it("Should get blockHash", function () {
      const res = headerId.blockHash;
      expect(res).to.eq("07A5D3E9602BDA81741C757AB6B8D6C4377D3AD1DB298EFE8305715C9B79281D");
   });

   it("Should get unixTimestamp", function () {
      const res = headerId.unixTimestamp;
      expect(res).to.eq(1671720971);
   });
});
