import { expect } from "chai";
import { MCC, rippleAddressToBytes, traceManager } from "../../src";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const XRPMccConnection = {
   url: process.env.XRP_URL_TESTNET || "",
   username: process.env.XRP_USERNAME || "",
   password: process.env.XRP_PASSWORD || "",
   apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
};

describe("Test utils ", function () {
   let MccClient: MCC.XRP;

   before(async function () {
      traceManager.displayRuntimeTrace = false;
      traceManager.displayStateOnException = false;
      MccClient = new MCC.XRP(XRPMccConnection);
   });

   it("should convert empty address to bytes ", async function () {
      const txid = "626FEB57692C69F6D31F753C31C2BA1222B53FCEBE7529B2F84ACF095E66F694";
      const transaction = await MccClient.getTransaction(txid);

      console.log(transaction.reference);

      console.log(transaction.stdPaymentReference);
   });
});
