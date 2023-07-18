import { MCC, UtxoMccCreate } from "../../src";

const BtcMccConnection = {
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
   url: process.env.BTC_URL || "",
   username: process.env.BTC_USERNAME || "",
   password: process.env.BTC_PASSWORD || "",
   rateLimitOptions: {
      timeoutMs: 15000,
   },
} as UtxoMccCreate;

// const cas = {
//    in: "e426fa2e99e5347498d6ca98fe6fb9a1e6c41385b57f32d2595c0cba317a0240",
//    out: "a376a66c1c6b02ddd57bd535d4b84580d34711d53020c5fa21cb8f478e761043",
// };

const cas = {
   in: "4e662306dac0950029251473e0375fdc2811662f35a219284d98b92b1034dbaa",
   out: "e74ba9eb1350f908afbac42ab141824bb5cebf506b54a21475e5ce0769077fd2",
};

describe.skip("Block BTC base test ", function () {
   let MccClient: MCC.BTC;

   before(async function () {
      MccClient = new MCC.BTC(BtcMccConnection);
   });

   it("Source transaction ", async function () {
      const txid = cas.in;
      const tx = await MccClient.getTransaction(txid);
      console.dir(tx._data, { depth: 10 });
   });

   it("Spending transaction ", async function () {
      const txid = cas.out;
      const tx = await MccClient.getTransaction(txid);
      console.dir(tx._data, { depth: 10 });
   });
});
