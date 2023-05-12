import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Client, Payment, Wallet } from "xrpl";
import { MCC } from "../../../src";

const xrpTestnetUrl = process.env.XRP_URL_TESTNET || "https://s.altnet.rippletest.net:51234/"; //  "https://testnet.xrpl-labs.com/";
const xrplWsUrl = process.env.XRP_WS_URL_TESTNET || "wss://s.altnet.rippletest.net:51233/"; // "wss://testnet.xrpl-labs.com/";

const XRPMccConnection = {
   url: xrpTestnetUrl,
};

async function submitBlob(client: AxiosInstance, blob: string, force: boolean = false) {
   return await client.post("", {
      method: "submit",
      params: [
         {
            tx_blob: blob,
            fail_hard: force,
         },
      ],
   });
}

const testnet_account_details = {
   address: "r2KxownZZyfH1mFeHHBfMip5E5P1aVsVQ",
   secret: "sEdT5zAaEjmRTiGTBNszF5twWSB8fVd",
   sequence: 37666155,
};

const deletedAcc = "r3nikhNWv6jzuk9jJutGHxfmqLqqRrpPGz";

// const generated_wallet = {
//    classicAddress: "rnwZWM9gsJhp4LTXRTHzeveS9Rgvkizoyk",
//    privateKey: "ED8ADFA03E04C5D0D8F0CCF5B8D2F77A7E53873A45A3EC3202545F062921E53DAE",
//    publicKey: "ED1447CB199D6FD2479FA61A536E8CDAFCAA780591444E82AFBE6A1D8D3CF7A424",
//    seed: "sEdVPRZgUUDPuqPUtLjx1p5ajMPFCtq",
// };

async function main() {
   const createAxiosConfig: AxiosRequestConfig = {
      baseURL: xrpTestnetUrl,
      timeout: 5000,
   };
   console.dir(createAxiosConfig, { depth: null });
   console.dir(XRPMccConnection, { depth: null });
   const client = axios.create(createAxiosConfig);
   const xrplJs = new Client(xrplWsUrl);
   const MccXrp = new MCC.XRP(XRPMccConnection);

   let rawTx2: Payment = {
      TransactionType: "Payment",
      Account: testnet_account_details.address,
      Destination: deletedAcc,
      DestinationTag: 42,
      Amount: (100 * 100000).toString(),
   };
   await xrplJs.connect();
   rawTx2 = await xrplJs.autofill(rawTx2);

   const wall = Wallet.fromSecret(testnet_account_details.secret);
   // 6. sign the tx
   const { tx_blob: tx_blob2, hash: hash2 } = wall.sign(rawTx2);

   // 7. submit the payment tx
   //  const resAtm = await xrplJs.submitAndWait(tx_blob2);
   const resAtm = await submitBlob(client, tx_blob2, true);

   console.log(hash2);
   console.dir(resAtm.data, { depth: null });
   console.log("====================================");

   // 8. Check the new transaction status from mcc client
   let txNew = await MccXrp.getTransaction(hash2);
   console.dir(txNew.data, { depth: null });

   // wait for validation:
   await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
   txNew = await MccXrp.getTransaction(hash2);
   console.dir(txNew.data, { depth: null });
}

async function main2() {
   const hh = "819A48989286D6DDF445A64B060A51B87187317169A95D4918C01B86467BF34A";
   const MccXrp = new MCC.XRP(XRPMccConnection);
   const txNew = await MccXrp.getTransaction(hh);
   console.dir(txNew.data, { depth: null });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main2()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .then(() => process.exit(0));
