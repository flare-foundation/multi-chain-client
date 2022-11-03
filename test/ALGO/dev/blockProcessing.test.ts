import { MCC, traceManager } from "../../../src";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require("chai");
// eslint-disable-next-line @typescript-eslint/no-var-requires
chai.use(require("chai-as-promised"));

const algoCreateConfig = {
   algod: {
      url: process.env.ALGO_ALGOD_URL_TESTNET || "",
      token: process.env.ALGO_ALGOD_URL_TESTNET || "",
   },
};

describe(`Algo block processing`, async () => {
   before(() => {
      traceManager.displayStateOnException = false;
   });

   it.only("Should be able to process 25254303", async function () {
      const MccClient = new MCC.ALGO(algoCreateConfig);
      const block = await MccClient.getBlock(25254303);
      console.log(block);

      // Properties
      console.log("block.blockHash            :", block.blockHash);
      console.log("block.number               :", block.number);
      console.log("block.previousBlockHash    :", block.previousBlockHash);
      console.log("block.stdBlockHash         :", block.stdBlockHash);
      console.log("block.stdPreviousBlockHash :", block.stdPreviousBlockHash);
      console.log("block.transactionCount     :", block.transactionCount);
      console.log("block.unixTimestamp        :", block.unixTimestamp);
      console.log("block.transactionIds       :", block.transactionIds);
      console.log("block.stdTransactionIds    :", block.stdTransactionIds);

      for (const tx of block.transactionObjects) {
         await tx.makeFull(MccClient);

         console.log("tx.assetReceivedAmounts    :", tx.assetReceivedAmounts);
         console.log("tx.assetReceivingAddresses :", tx.assetReceivingAddresses);
         console.log("tx.assetSourceAddresses    :", tx.assetSourceAddresses);
         console.log("tx.assetSpentAmounts       :", tx.assetSpentAmounts);
         console.log("tx.currencyName            :", tx.currencyName);
         console.log("tx.elementaryUnits         :", tx.elementaryUnits.toString());
         console.log("tx.fee                     :", tx.fee.toString());
         console.log("tx.hash                    :", tx.hash);
         console.log("tx.isNativePayment         :", tx.isNativePayment);
         console.log("tx.receivedAmounts         :", tx.receivedAmounts);
         console.log("tx.receivingAddresses      :", tx.receivingAddresses);
         console.log("tx.reference               :", tx.reference);
         console.log("tx.sourceAddresses         :", tx.sourceAddresses);
         console.log("tx.spentAmounts            :", tx.spentAmounts);
         console.log("tx.stdPaymentReference     :", tx.stdPaymentReference);
         console.log("tx.stdTxid                 :", tx.stdTxid);
         console.log("tx.successStatus           :", tx.successStatus);
         console.log("tx.txid                    :", tx.txid);
         console.log("tx.type                    :", tx.type);
         console.log("tx.unixTimestamp           :", tx.unixTimestamp);
      }
   });

   it("Should be able to process 25252901", async function () {
      const MccClient = new MCC.ALGO(algoCreateConfig);
      const block = await MccClient.getBlock(25252901);

      console.log(block);
   });
});
