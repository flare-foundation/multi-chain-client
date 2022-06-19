import { expect } from "chai";
import { MCC, UtxoMccCreate, UtxoNodeStatus, XrpNodeStatus } from "../../src";

const DogeMccConnection = {
   url: process.env.DOGE_URL || "",
   username: process.env.DOGE_USERNAME || "",
   password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

describe("Block BTC base test ", function () {
   let MccClient: MCC.DOGE;
   let status: UtxoNodeStatus;

   before(async function () {
      MccClient = new MCC.DOGE(DogeMccConnection);
      status = await MccClient.getNodeStatus();
   });

   it("Should get status version ", async function () {
      const version = status.version.split("_");
      expect(version[0]).to.be.eq("1140500");
   });

   it("Should get status state ", async function () {
      expect(status.state).to.eq('full');
   });

   it("Should get status isHealthy ", async function () {
      // console.log(status.isHealthy);
      expect(status.isHealthy).to.eq(true);
   });

   it("Should get status isSynced ", async function () {
      // console.log(status.isSynced);
      expect(status.isSynced).to.eq(true);
   });
});
