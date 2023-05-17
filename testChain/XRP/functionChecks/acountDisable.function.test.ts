// This test answers the question:
// If you delete and account that used to be valid, can you still send a transaction to it so it is recreated with tec status (ie present in block)

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { AccountDelete, Client, Payment, Wallet, decode } from "xrpl";
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

// const generated_wallet = {
//    classicAddress: "rnwZWM9gsJhp4LTXRTHzeveS9Rgvkizoyk",
//    privateKey: "ED8ADFA03E04C5D0D8F0CCF5B8D2F77A7E53873A45A3EC3202545F062921E53DAE",
//    publicKey: "ED1447CB199D6FD2479FA61A536E8CDAFCAA780591444E82AFBE6A1D8D3CF7A424",
//    seed: "sEdVPRZgUUDPuqPUtLjx1p5ajMPFCtq",
// };

async function main() {
   const createAxiosConfig: AxiosRequestConfig = {
      baseURL: xrpTestnetUrl,
      timeout: 60000,
   };
   console.dir(createAxiosConfig, { depth: null });
   console.dir(XRPMccConnection, { depth: null });
   const client = axios.create(createAxiosConfig);
   const xrplJs = new Client(xrplWsUrl);
   const MccXrp = new MCC.XRP(XRPMccConnection);

   // 1. Create a new account to delete
   //  const account_to_delete = {
   //     address: "rfrjupMPRhaBdZzMuZXKjd8uApUjUjeXiQ",
   //     secret: "sEdVrCAe8ZmQAGHLcqniBBBS7urRj61",
   //     sequence: 37684826,
   //  };
   //  const newWallet = Wallet.fromSecret(account_to_delete.secret);

   await xrplJs.connect();
   const newWalletGen = await xrplJs.fundWallet();

   await new Promise((r) => setTimeout(r, 15 * 1000));

   const acc = await client.post("", {
      method: "account_info",
      params: [
         {
            account: newWalletGen.wallet.address,
            strict: true,
            ledger_index: "current",
            queue: true,
         },
      ],
   });

   console.dir(acc.data, { depth: null });

   const seq = acc.data.result.account_data.Sequence;

   while (seq + 256 + 1 < (await MccXrp.getBlockHeight())) {
      console.log("sleeping for 5 seconds to get sequence high enough");
      await new Promise((r) => setTimeout(r, 5 * 1000));
   }

   //  const newWallet = newWalletGen.wallet;
   //  const newWallet = Wallet.fromSeed(newWalletGen.wallet.seed || "");
   //  const destWallet = Wallet.fromSecret(testnet_account_details.secret);
   const destWallet = Wallet.fromSeed(newWalletGen.wallet.seed || "");
   const newWallet = Wallet.fromSecret(testnet_account_details.secret);
   console.dir(newWallet, { depth: null });

   // balance must be less than 1000
   //  let balnace_reduction_tx: Payment = {
   //     TransactionType: "Payment",
   //     Account: newWallet.address,
   //     Destination: destWallet.classicAddress,
   //     DestinationTag: 42,
   //     Amount: (10000 - 950).toString() + "000000", // TODO: get balance from api
   //  };
   //  balnace_reduction_tx = await xrplJs.autofill(balnace_reduction_tx);
   //  const signed = newWallet.sign(balnace_reduction_tx);
   //  const bdp_sub = await xrplJs.submitAndWait(signed.tx_blob);

   //  console.log("Balance dec data");
   //  console.dir(bdp_sub, { depth: null });

   // Wait for some time
   //  const now = new Date();
   //  console.log("Waiting for 5 minutes ending at: ", new Date(now.getTime() + 5 * 60 * 1000).toISOString());
   //  await new Promise((r) => setTimeout(r, 5 * 60 * 1000));

   // 2. Prepare account dele transaction
   let deleteTransaction: AccountDelete = {
      TransactionType: "AccountDelete",
      Account: newWallet.classicAddress,
      Destination: testnet_account_details.address,
      Fee: "200000012",
      DestinationTag: 69,
   };

   deleteTransaction = await xrplJs.autofill(deleteTransaction);
   //  rawTx.LastLedgerSequence ? (rawTx.LastLedgerSequence += 1000) : (rawTx.LastLedgerSequence = 1000);

   // 3 sign the tx
   const deleteTx = newWallet.sign(deleteTransaction);
   console.log("Account delete signed transactions");
   console.dir(deleteTx, { depth: null });

   // 4. submit the tx
   const dec = decode(deleteTx.tx_blob);
   console.dir(dec, { depth: null });
   //  const res = await xrplJs.submitAndWait(deleteTx.tx_blob, { failHard: true });

   const res = await submitBlob(client, deleteTx.tx_blob, true);

   console.log("Account delete submitted");
   console.dir(res.data, { depth: null });

   // 5. Create new transaction to the deleted account

   let rawTx2: Payment = {
      TransactionType: "Payment",
      Account: testnet_account_details.address,
      Destination: newWallet.classicAddress,
      DestinationTag: 42,
      Amount: "10000000",
   };
   rawTx2 = await xrplJs.autofill(rawTx2);

   // 6. sign the tx
   const { tx_blob: tx_blob2, hash: hash2 } = destWallet.sign(rawTx2);

   // 7. submit the payment tx
   //  const resAtm = await xrplJs.submitAndWait(tx_blob2);
   const resAtm = await submitBlob(client, tx_blob2, true);

   console.log("Payment transaction attempt to deleted account submitted");
   console.dir(resAtm.data, { depth: null });

   await xrplJs.disconnect();

   // 8. Check the new transaction status from mcc client
   const txNew = await MccXrp.getTransaction(hash2);
   console.dir(txNew._data, { depth: null });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .then(() => process.exit(0));
