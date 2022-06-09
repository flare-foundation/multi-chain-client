import { EncodedTransaction } from "algosdk";
import { AlgoTransaction } from "../base-objects/TransactionBase";
import { RateLimitOptions } from "../types";
import { optional } from "../utils/typeReflection";
import { IIGetBlockRes, IIGetTransactionRes, MccLoggingOptions } from "./genericMccTypes";

export class AlgoMccCreate {
   algod = new AlgoNodeApp();
   @optional() indexer? = new AlgoNodeApp();
   @optional() inRegTest? = false;
   @optional() rateLimitOptions? = new RateLimitOptions();
   @optional() loggingOptions? = new MccLoggingOptions();
}

export class AlgoNodeApp {
   url: string = "";
   token: string = "";
}

export interface IAlgoStatusRes {
   catchpoint?: string;
   catchpointAcquiredBlocks?: number;
   catchpointProcessedAccounts?: number;
   catchpointTotalAccounts?: number;
   catchpointTotalBlocks?: number;
   catchpointVerifiedAccounts?: number;
   catchupTime: number;
   lastCatchpoint?: string;
   lastRound: number;
   lastVersion: string;
   nextVersion: string;
   nextVersionRound: number;
   nextVersionSupported: boolean;
   stoppedAtUnsupportedRound: boolean;
   timeSinceLastRound: number;
}

export interface IAlgoBlockHeaderData {
   earn: number;
   fees: string;
   frac: number;
   gen: string;
   gh: string;
   prev: string;
   proto: string;
   rnd: number; // block height
   rwcalr: number;
   rwd: string;
   seed: string;
   tc: number;
   ts: number;
   txn: string;
   txns: any[]; // improve
}

// indexer block
export interface IAlgoBlockData {
   genesisHash: string;
   genesisId: string;
   previousBlockHash: string;
   rewards?: any;
   round: number;
   seed: string;
   timestamp: number;
   transactions?: IAlgoTransaction[];
   transactionsRoot: string;
   txnCounter?: number;
   upgradeState: any;
   upgradeVote: any;
}

interface IAlgoCertProp {
   dig: Buffer;
   encdig: Buffer;
   oprop: Buffer;
}
export interface IAlgoCert {
   prop: IAlgoCertProp;
   rnd: number;
   step: number;
   vote: any[];
}

export interface IAlgoGetBlockRes extends IAlgoBlockData, IIGetBlockRes {
   cert: IAlgoCert;
   type: "IAlgoGetBlockRes";
}

export interface IAlgoGetBlockHeaderRes {
   type: "IAlgoGetBlockHeaderRes";
   block: IAlgoBlockHeaderData;
   cert: IAlgoCert;
}

export interface IAlgoBlockMsgPackBlock {
   earn: number;
   fees: string;
   frac: number;
   gen: string;
   gh: Buffer;
   prev: string;
   proto: string;
   rnd: number;
   rwcalr: number;
   rwd: string;
   seed: string;
   tc: number;
   ts: number;
   txn: string;
   txns: any[]; // Array of transaction objects
}

export interface IAlgoBlockMsgPack {
   block: IAlgoBlockMsgPackBlock;
   cert: IAlgoCert;
}

export interface IAlgoBlockAdditionalData {
   transactionsObjects: AlgoTransaction[]
}

export interface IAlgoSignature {
   sig: string;
}

export interface IAlgoPaymentTransaction {
   amount: number;
   closeAmount?: number;
   closeRemainderTo?: string;
   receiver: string;
}

/**
 * Docs from : https://developer.algorand.org/docs/rest-apis/indexer/#transaction
 */
export interface IAlgoTransaction {
   applicationTransaction?: any;
   assetConfigTransaction?: any;
   assetFreezeTransaction?: any;
   assetTransferTransaction?: any;
   authAddr?: string;
   closeRewards?: number;
   closingAmount?: number;
   confirmedRound?: number;
   createdApplicationIndex?: number;
   fee: number;
   firstValid: number;
   genesisHash?: string;
   genesisId?: string;
   globalStateDelta?: any;
   group?: string;
   id?: string;
   innerTxns?: IAlgoTransaction[];
   intraRoundOffset?: number;
   keyregTransaction?: any;
   lastValid: number;
   lease?: string;
   localStateDelta?: any;
   logs?: string[];
   note?: string;
   paymentTransaction?: IAlgoPaymentTransaction;
   receiverRewards?: number;
   rekeyTo?: string;
   roundTime?: number;
   sender: string;
   senderRewards?: number;
   signature?: IAlgoSignature;
   txType: AlgoTransactionTypeOptions;
   // * [pay] payment-transaction
   // * [keyreg] keyreg-transaction
   // * [acfg] asset-config-transaction
   // * [axfer] asset-transfer-transaction
   // * [afrz] asset-freeze-transaction
   // * [appl] application-transaction
}

interface IALgoApar {
   an: string;
   au: string;
   t: number;
   un: string;
}

// take as reference https://github.com/algorand/go-algorand-sdk/blob/develop/types/transaction.go

// todo need keyreg and afrz tx example
// export interface IAlgoTransactionMsgPack {
//    fee: number;
//    fv: number; // first valid
//    lv: number; // lastValid
//    snd: string; // sender
//    type: AlgoTransactionTypeOptions; // transaction type

//    note?: string; // note
//    rcv?: string; // receiver

//    grp?: string;

//    amt?: number; // in pay
//    apaa?: string[]; // in appl
//    apas?: number[]; // in appl 
//    apat?: string[]; // in appl
//    apid?: number; // in appl
//    apar?: IALgoApar; // in acfg 
//    aamt?: number; // in axfer
//    arcv?: string; // in axfer // AssetReceiver
//    xaid?: number; // in axfer
// }

export type IAlgoTransactionMsgPack = EncodedTransaction & {
   txid: string; // Base32 txid as string (calculated in block processing)
   timestamp: number; // unix timestamp from block (transactions get timestamp from block they are in)
   hgi: boolean;
   sig?: Buffer; // signature
   lsig?: Buffer; // l signature
   msig?: Buffer; // multi signature
   sgnr?: Buffer; // s signature
}

export type AlgoTransactionTypeOptions = "pay" | "keyreg" | "acfg" | "axfer" | "afrz" | "appl";
// * pay    -  payment-transaction
// * keyreg - keyreg-transaction
// * acfg   - asset-config-transaction
// * axfer  - asset-transfer-transaction
// * afrz   - asset-freeze-transaction
// * appl   - application-transaction
export interface IAlgoLitsTransaction {
   address?: string; // Only include transactions with this address in one of the transaction fields.
   addressRole?: "sender" | "receiver" | "freeze-target"; // Combine with the address parameter to define what type of address to search for.

   // Must be an RFC 3339 formatted string. Example  2019-10-12T07:20:50.52Z
   afterTime?: string; // Include results after the given time.
   beforeTime?: string; // Include results before the given time

   // Results should have an amount greater/less than this value.
   // MicroAlgos are the default currency unless an asset-id is provided,
   // in which case the asset will be used.
   currencyGreaterThan?: number;
   currencyLessThan?: number;

   // Combine with address and address-role parameters to define what type of address to search for.
   // The close to fields are normally treated as a receiver, if you would like to exclude them set
   // this parameter to true.
   excludeCloseTo?: boolean;

   applicationId?: number;
   assetId?: number;

   limit?: number; // maximum number of result to return

   maxRound?: number; // Include only results before given round (block)
   minRound?: number; // Include only results after given round (block)
   round?: number; // Include results for specific round

   next?: string; // The next page of results. Use the next token provided by the previous results.

   notePrefix?: string; // Specifies a prefix which must be contained in the note field.
   rekeyTo?: boolean; // Include results which include the rekey-to field.

   // SigType filters just results using the specified type of signature:
   // * sig - Standard
   // * msig - MultiSig
   // * lsig - LogicSig
   sigType?: "sig" | "msig" | "lsig";

   txType?: "pay" | "keyreg" | "acfg" | "axfer" | "afrz" | "appl";
   txid?: string; // Lookup specific transaction
}

export interface IAlgoGetTransactionRes extends IIGetTransactionRes {
   currentRound: number;
   transaction: IAlgoTransaction;
}

export interface IAlgoGetFullTransactionRes extends IAlgoTransaction, IIGetTransactionRes {
   currentRound: number;
}

export interface IAlgoListTransactionRes {
   currentRound: number;
   nextToken?: string;
   transactions: IAlgoTransaction[];
}

// Algo status types

export interface IAlgoGetStatus {
   catchpoint?: string;
   catchpointAcquiredBlocks?: number;
   catchpointProcessedAccounts?: number;
   catchpointTotalAccounts?: number;
   catchpointTotalBlocks?: number;
   catchpointVerifiedAccounts?: number;
   catchupTime: number;
   lastCatchpoint?: string;
   lastRound: number;
   lastVersion: string;
   nextVersion: string;
   nextVersionRound: number;
   nextVersionSupported: boolean;
   stoppedAtUnsupportedRound: boolean;
   timeSinceLastRound: number;
}

export interface IAlgoBuildVersion {
   branch: string;
   buildNumber: number;
   channel: string;
   commitHash: string;
   major: number;
   minor: number;
}

export interface IAlgoVersion {
   build: IAlgoBuildVersion;
   genesisHashB64: string;
   genesisId: string;
   versions: string[];
}

export interface IAlgoStatusObject {
   health: number;
   status: IAlgoGetStatus;
   versions: IAlgoVersion;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// Algo utils types ////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IAlgoHexAddress {
   publicKey: string; // should be of length 64
   checksum: string; // should be of length 8
}
