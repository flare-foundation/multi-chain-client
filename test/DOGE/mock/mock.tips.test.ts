import { expect } from "chai";
import { MCC, UtxoMccCreate } from "../../../src";
import MockAdapter from "axios-mock-adapter";

const DogeMccConnection = {
   url: process.env.DOGE_URL || "",
   username: process.env.DOGE_USERNAME || "",
   password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

describe("Chain tips test ", function () {
   let MccClient: MCC.DOGE;
   let mock: MockAdapter;
   before(async function () {
      MccClient = new MCC.DOGE(DogeMccConnection);

      mock = new MockAdapter(MccClient.client, { onNoMatch: "passthrough" });

      const latest = 4410875;
            
      mock
         .onPost("", {
            // asymmetricMatch: (actual: any) => actual.method === "getblockcount",
            jsonrpc: "1.0",
            id: "rpc",
            method: "getblockcount",
            params: [],
         })
         .reply(200, { result: latest + 3 });
   });

   after(async function () {
      mock.reset();
   });

   it("Should get tips and all blocks to certain height ", async function () {
      // const height = await MccClient.getBlockHeight();
      // console.log(height);

      const tips = await MccClient.getTopLiteBlocks(5);
      // Most of the time eq
      // console.log(tips);

      expect(tips.length).to.greaterThanOrEqual(6);
   });
});
