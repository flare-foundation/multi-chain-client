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
      const tstatus = await MccClient.getNodeStatus();
      if (tstatus) {
         status = tstatus;
      }
   });

   it("Should get status version ", async function () {
      console.log(status.version);
   });

   it("Should get status state ", async function () {
      console.log(status.state);
   });

   it("Should get bottom Block ", async function () {
      console.log(status.bottomBlock);
   });

   it("Should get status isHealthy ", async function () {
      console.log(status.isHealthy);
   });

   it("Should get status isSynced ", async function () {
      console.log(status.isSynced);
   });

   it("Should get full data ", async function () {
      console.log(status.data);
   });
});
