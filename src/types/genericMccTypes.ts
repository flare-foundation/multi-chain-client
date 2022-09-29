import { IBlock } from "../base-objects/BlockBase";
import { LiteBlock } from "../base-objects/blocks/LiteBlock";
import { INodeStatus } from "../base-objects/StatusBase";
import { ITransaction } from "../base-objects/TransactionBase";

interface BaseRpcInterface {
   chainType: ChainType;
}

export interface ReadRpcInterface extends BaseRpcInterface {
   // General methods
   getNodeStatus(): Promise<INodeStatus>;
   /**
    * The lowest block in the latest joined set of blocks
    */
   getBottomBlockHeight(): Promise<number>;

   // Block data
   getBlock(blockNumberOrHash: number | string | any): Promise<IBlock>;
   getBlockHeight(): Promise<number>;

   // To be used with chain tip indexer processing
   getBlockTips?(height_gte: number): Promise<LiteBlock[]>;
   getTopLiteBlocks?(branch_len: number): Promise<LiteBlock[]>;

   // Transaction data
   getTransaction(txId: string, metaData?: getTransactionOptions): Promise<ITransaction>;
   listTransactions?(options?: any): any;

   // bottom block in connected node (0 if nodes dont support partial history)
}

export interface WriteRpcInterface extends BaseRpcInterface {
   // Wallets

   // Addresses
   createAddress(createAddressData: any): any;

   // Transactions
   createRawTransaction(walletLabel: string, vin: any[], out: any[]): any;
   signRawTransaction(walletLabel: string, rawTx: string, keysList: string[]): any;
   sendRawTransaction(walletLabel: string, signedRawTx: string): any;
   sendRawTransactionInBlock(walletLabel: string, signedRawTx: string): any;

   // Faucet
   fundAddress(address: string, amount: number): any;
}

export interface RPCInterface extends ReadRpcInterface, WriteRpcInterface {}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// MCC base response interfaces ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Parent Class objects that are extended on each unique underlying chain

export interface IIGetTransactionRes {}

export interface IIGetBlockRes {}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// Flare attestation interfaces ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export enum TransactionSuccessStatus {
   SUCCESS = 0,
   SENDER_FAILURE = 1, // if there is a failure and cannot be clearly attributed to the receiver, then it is SENDER_FAILURE
   RECEIVER_FAILURE = 2,
}

/**
 * Object to use in get transaction additional parameters
 */
export interface getTransactionOptions {
   verbose?: boolean;
   binary?: boolean;
   min_block?: number;
   max_block?: number;
}

export enum ChainType {
   invalid = -1,
   BTC = 0,
   LTC = 1,
   DOGE = 2,
   XRP = 3,
   ALGO = 4,
   // ... make sure IDs are the same as in Flare node
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// Logging /////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Mode of debugging (default to off)
// - off : no debugging
// - production : light weight debugging that can be used on production
// - develop : full debugging mode
export type LoggingModes = "off" | "production" | "develop";

export type IExceptionCallback = (error: any, message: string) => void;
export type ILoggingCallback = (message: string) => void;

export class MccLoggingOptions {
   mode?: LoggingModes;
   loggingCallback?: ILoggingCallback;
   warningCallback?: ILoggingCallback;
   exceptionCallback?: IExceptionCallback;
}

export class MccLoggingOptionsFull {
   mode!: LoggingModes;
   loggingCallback!: ILoggingCallback;
   warningCallback!: ILoggingCallback;
   exceptionCallback!: IExceptionCallback;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// Lite blocks /////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Possible values for status:
 *  1.  "invalid"               This branch contains at least one invalid block
 *  2.  "headers-only"          Not all blocks for this branch are available, but the headers are valid
 *  3.  "valid-headers"         All blocks are available for this branch, but they were never fully validated
 *  4.  "valid-fork"            This branch is not part of the active chain, but is fully validated
 *  5.  "active"                This is the tip of the active main chain, which is certainly valid
 */
export interface IGetLiteBlockRes {
   hash: string;
   number: number;
   branchlen: number
   status: 'invalid' | 'headers-only' | 'valid-headers' | 'valid-fork' | 'active'
}

export interface IEmptyObject {}
