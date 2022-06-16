import { expect } from "chai";
import { unPrefix0x } from "../src";
import { IIUtxoVout } from "../src/types";
import { addressToHex, hexToBytes } from "../src/utils/algoUtils";

export const expectThrow = async (method: any, errorMessage: any) => {
   let error = null;
   try {
      await method;
   } catch (err: any) {
      error = err;
   }
   if (typeof errorMessage === "object") {
      for (let prop in errorMessage) {
         expect(error).to.haveOwnProperty(prop);
         expect(error[prop]).to.eq(errorMessage[prop]);
      }
   } else {
      expect(error).to.equal(errorMessage);
   }
};

export function round_for_ltc(input: number) {
   return parseFloat(input.toFixed(8));
}

export async function sendMinimalUTXOTransaction(RPC: any, fromWalletLabel: string, from: string, to: string) {
   let unspent = await RPC.listUnspentTransactions(fromWalletLabel);
   let vin = [];
   let vinaddresses = [];
   let unspentAmount = 0;
   for (let utx of unspent) {
      console.log("ALL utxo", utx);

      if (utx.address == from) {
         console.log(utx);

         vin.push({
            txid: utx.txid,
            vout: utx.vout,
         });
         vinaddresses.push(utx.address);
         unspentAmount += utx.amount;
      }
   }
   const gas = 1e-5;
   const test_amount = 1e-5;
   if (unspentAmount < gas + test_amount) {
      console.error("Not enough founds on sender wallet");
      throw Error("Insufficient founds on sender wallet");
   }
   let vout: IIUtxoVout[] = [
      { address: to, amount: test_amount },
      { address: from, amount: round_for_ltc(unspentAmount - test_amount - gas) },
   ];
   let a = await RPC.createRawTransaction(fromWalletLabel, vin, vout);
   let signkeys = [];
   for (let add of vinaddresses) {
      signkeys.push(await RPC.getPrivateKey(fromWalletLabel, add));
   }
   let signedTx = await RPC.signRawTransaction(fromWalletLabel, a, signkeys);
   const txId = await RPC.sendRawTransactionInBlock(fromWalletLabel, signedTx.hex);
   return txId;
}

export function addressToBtyeAddress(address: string) : Uint8Array {
   const algoKeyPair = addressToHex(address);
   return hexToBytes(unPrefix0x(algoKeyPair.publicKey) + unPrefix0x(algoKeyPair.checksum));
}