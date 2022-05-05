import { RateLimitOptions } from "../types";
import { optional } from "../utils/typeReflection";
import { IIGetBlockRes, IIGetTransactionRes, MccLoggingOptions, RPCInterface } from "./genericMccTypes";

export class UtxoMccCreate {
   url: string = "";
   username: string = "";
   password: string = "";
   @optional() inRegTest?: boolean;
   @optional() rateLimitOptions? = new RateLimitOptions();
   @optional() loggingOptions? = new MccLoggingOptions();
}

// Creating transactions
export interface IIUtxoVin {
   txid: string;
   vout: number;
   sequence?: number;
}

export interface IIUtxoVout {
   address: string;
   amount: number;
}

export interface IUtxoScriptPubKey {
   asm: string;
   hex: string;
   reqSigs?: number;
   type: string; // choices :  "witness_v0_keyhash",
   addresses?: string[];
   address?: string;
}

export interface UtxoVout {
   value: number;
   n: number;
   scriptPubKey: IUtxoScriptPubKey;
}

export interface IUtxoScriptSig {
   asm: string;
   hex: string;
}

export interface IUtxoWalletRes {
   name: string;
   warning: string;
}

export interface getAddressByLabelResponse {
   address: string;
   purpose: string; // TODO make this a choice:  "receive" |
}

export interface IUtxoTransactionListRes {
   txid: string;
   vout: number;
   address: string;
   label: string;
   scriptPubKey: string;
   amount: number;
   confirmations: number;
   spendable: boolean;
   solvable: boolean;
   desc: string;
   safe: boolean;
}

export interface IUtxoGetBlockHeaderRes {
   hash: string;
   confirmations: number;
   height: number;
   version: number;
   versionHex: string;
   merkleroot: string;
   time: number;
   mediantime: number;
   nonce: number;
   bits: string;
   difficulty: number;
   chainwork: string;
   previousblockhash: string;
   nextblockhash: string;
}

export interface IUtxoGetBlockRes extends IUtxoGetBlockHeaderRes, IIGetBlockRes {
   size: number;
   strippedsize: number;
   weight: number;
   tx: IUtxoInBlockTransaction[]; // | string[] // if verbose is 1
   nTx: number;
}

/**
 * Vin interface from transaction details requests
 */
export interface IUtxoVinTransaction {
   coinbase?: string;
   sequence: number;
   txid?: string;
   vout?: number;
   scriptSig?: IUtxoScriptSig;
   txinwitness?: string[];
}

export interface IUtxoCoinbase {
   coinbase?: string;
}

export interface IUtxoVoutTransaction {
   value: number;
   n: number;
   scriptPubKey: IUtxoScriptPubKey;
}

export interface IUtxoInBlockTransaction extends IIGetTransactionRes {
   txid: string;
   hash: string;
   version: number;
   size: number;
   vsize: number;
   weight: number;
   locktime: number;
   vin: IUtxoVinTransaction[];
   vout: IUtxoVoutTransaction[];
   hex: string;
}

export interface IUtxoGetTransactionRes extends IIGetTransactionRes {
   txid: string;
   hash: string;
   version: number;
   size: number;
   vsize: number;
   weight: number;
   locktime: number;
   vin: IUtxoVinTransaction[];
   vout: IUtxoVoutTransaction[];
   hex: string;
   blockhash: string;
   confirmations: number;
   time: number;
   blocktime: number;
}

export interface IUtxoGetAlternativeBlocksOptions {
   height_gte?: number; // We only want tips / blocks that happened after specified height
   all_blocks?: boolean; // If we want to get all
}

export type IUtxoGetAlternativeBlocksRes = IUtxoChainTip[];

export interface IUtxoChainTip {
   height: number; // height of the chain tip
   hash: string; // block hash of the tip
   branchlen: number; // zero for main chain
   status: "active" | "valid-fork" | "valid-headers" | "headers-only" | "invalid";
   // Possible status options
   // 1.  "invalid"               This branch contains at least one invalid block
   // 2.  "headers-only"          Not all blocks for this branch are available, but the headers are valid
   // 3.  "valid-headers"         All blocks are available for this branch, but they were never fully validated
   // 4.  "valid-fork"            This branch is not part of the active chain, but is fully validated
   // 5.  "active"                This is the tip of the active main chain, which is certainly valid
   all_block_hashes?: string[]; // Array of all hashes that are on alternative (orphaned) branch, only returned if all_blocks is set to True
}

// Deprecated
// export interface IUtxoGetFullTransactionRes extends IUtxoGetTransactionRes, IIGetTransactionRes {
//    // List of v-outs that were used in vins of the transaction, or coinbase strings if transaction is a coinbase transaction
//    vinouts: (IUtxoVoutTransaction | IUtxoCoinbase)[];
// }

export interface IUtxoVinVoutsMapper {
   index: number;
   vinvout: IUtxoVoutTransaction | undefined;
}

export interface IUtxoTransactionAdditionalData {
   vinouts?: (IUtxoVinVoutsMapper | undefined)[];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// MCC RPC implementation interfaces ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface UtxoRpcInterface extends RPCInterface {
   getBlockHeader(blockHash: string): any;

   createWallet(walletLabel: string): any;

   loadWallet(walletLabel: string): any;

   createAddress(walletLabel: string, addressLabel?: string, address_type?: string): any;

   listAllWallets(): any;

   listAllAddressesByLabel(walletLabel: string, addressLabel: string): Promise<any[]>;

   listUnspentTransactions(walletLabel: string, min: number, max: number): any;

   getPrivateKey(walletLabel: string, address: string): any;
}
