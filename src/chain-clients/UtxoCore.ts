import axios, { AxiosInstance } from "axios";

import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { UtxoBlockHeader } from "../base-objects/blockHeaders/UtxoBlockHeader";
import { UtxoBlockTip } from "../base-objects/blockTips/UtxoBlockTip";
import { getAddressByLabelResponse, IIUtxoVin, IIUtxoVout, IUtxoTransactionListRes, IUtxoWalletRes, UtxoMccCreate } from "../types";
import { ChainType, getTransactionOptions, ReadRpcInterface } from "../types/genericMccTypes";
import {
   IUtxoChainTip,
   IUtxoGetAlternativeBlocksOptions,
   IUtxoGetAlternativeBlocksRes,
   IUtxoGetBlockHeaderRes,
   IUtxoGetBlockRes,
   IUtxoGetTransactionRes,
   IUtxoNodeStatus,
   IUtxoTransactionAdditionalData,
} from "../types/utxoTypes";
import { PREFIXED_STD_BLOCK_HASH_REGEX, PREFIXED_STD_TXID_REGEX } from "../utils/constants";
import { mccError, mccErrorCode } from "../utils/errors";
import { sleepMs, unPrefix0x } from "../utils/utils";
import { utxo_check_expect_block_out_of_range, utxo_check_expect_empty, utxo_ensure_data } from "../utils/utxoUtils";
import { FullBlockBase } from "../base-objects/FullBlockBase";
import { UtxoTransaction } from "../base-objects/transactions/UtxoTransaction";
import { UtxoBlock } from "../base-objects/blocks/UtxoBlock";
import { UtxoNodeStatus } from "../base-objects/status/UtxoStatus";
import { RateLimitOptions } from "../types/axiosRateLimitTypes";

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
   maxRPS: 5,
};

interface objectConstructors<
   TranCon extends UtxoTransaction,
   FBlockCon extends FullBlockBase<UtxoTransaction>,
   BlockCon extends UtxoBlock,
   BHeadCon extends UtxoBlockHeader,
   BTipCon extends UtxoBlockTip
> {
   transactionConstructor: new (d: IUtxoGetTransactionRes, a?: IUtxoTransactionAdditionalData) => TranCon;
   fullBlockConstructor: new (d: IUtxoGetBlockRes) => FBlockCon;
   blockConstructor: new (d: IUtxoGetBlockRes) => BlockCon;
   blockHeaderConstructor: new (d: IUtxoGetBlockHeaderRes) => BHeadCon;
   blockTipConstructor: new (d: IUtxoChainTip) => BTipCon;
}

export abstract class UtxoCore<
   TranCon extends UtxoTransaction,
   FBlockCon extends FullBlockBase<UtxoTransaction>,
   BlockCon extends UtxoBlock,
   BHeadCon extends UtxoBlockHeader,
   BTipCon extends UtxoBlockTip
> implements ReadRpcInterface
{
   client: AxiosInstance;
   inRegTest: boolean;
   // eslint-disable-next-line prettier/prettier
   constructors: objectConstructors<TranCon, FBlockCon, BlockCon, BHeadCon, BTipCon>;
   chainType: ChainType;

   constructor(createConfig: UtxoMccCreate, constructors: objectConstructors<TranCon, FBlockCon, BlockCon, BHeadCon, BTipCon>) {
      const client = axios.create({
         baseURL: createConfig.url,
         timeout: createConfig.rateLimitOptions?.timeoutMs || DEFAULT_TIMEOUT,
         headers: {
            "Content-Type": "application/json",
            "x-apikey": createConfig.apiTokenKey || "",
         },
         auth: {
            username: createConfig.username,
            password: createConfig.password,
         },
         validateStatus: function (status: number) {
            return (status >= 200 && status < 300) || status == 500;
         },
      });
      this.client = axiosRateLimit(client, {
         ...DEFAULT_RATE_LIMIT_OPTIONS,
         ...createConfig.rateLimitOptions,
      });
      this.inRegTest = createConfig.inRegTest || false;

      // This has to be shadowed
      this.constructors = constructors;
      this.chainType = ChainType.BTC;
   }

   /**
    * Return node status object for Utxo nodes
    */

   async getNodeStatus(): Promise<UtxoNodeStatus> {
      const res = await this.getNetworkInfo();

      const infoRes = await this.client.post(``, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getblockchaininfo",
         params: [],
      });
      utxo_ensure_data(infoRes.data);

      return new UtxoNodeStatus({ ...infoRes.data.result, ...res.result } as IUtxoNodeStatus);
   }

   /**
    * On Utxo chains nodes always need full history
    * @returns 0
    */

   async getBottomBlockHeight(): Promise<number> {
      return 0;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Read part of RPC Client ////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   ///////////////////////////////////////////////////////////////////////////////////////
   // Block methods //////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   private async blockRequestBase(blockNumberOrHash: string | number, full: boolean) {
      let blockHash: string;
      if (typeof blockNumberOrHash === "string") {
         blockHash = blockNumberOrHash as string;
      } else if (typeof blockNumberOrHash === "number") {
         try {
            blockHash = await this.getBlockHashFromHeight(blockNumberOrHash as number);
         } catch (e) {
            throw new mccError(mccErrorCode.InvalidParameter);
         }
      } else {
         // This type is not supported
         throw new mccError(mccErrorCode.InvalidParameter);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let params: any[] = [blockHash, full ? 3 : 1];
      if (this.chainType === ChainType.DOGE) {
         params = [blockHash, true];
      }
      return await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getblock",
         params: params,
      });
   }

   async getFullBlock(blockNumberOrHash: string | number): Promise<FBlockCon> {
      const res = await this.blockRequestBase(blockNumberOrHash, true);
      if (utxo_check_expect_block_out_of_range(res.data)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      utxo_ensure_data(res.data);
      return new this.constructors.fullBlockConstructor(res.data.result);
   }

   /**
    * Returns the block information
    * @param blockHashOrHeight Provide either block hash or height of the block
    * @returns All available block information
    */
   //
   async getBlock(blockNumberOrHash: string | number): Promise<BlockCon> {
      const res = await this.blockRequestBase(blockNumberOrHash, true);
      if (utxo_check_expect_block_out_of_range(res.data)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      utxo_ensure_data(res.data);
      return new this.constructors.blockConstructor(res.data.result);
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   async getBlockHeader(blockNumberOrHash: number | string | any): Promise<BHeadCon> {
      const header = await this.getBlockHeaderBase(blockNumberOrHash);
      return new this.constructors.blockHeaderConstructor(header);
   }

   /**
    * Get Block height (number of blocks) from connected chain
    * @returns block height (block count)
    */

   async getBlockHeight(): Promise<number> {
      const res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getblockcount",
         params: [],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Transaction methods ////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   /**
    * Get transaction details
    * @param txId Transaction id
    * @param options provide verbose:boolean, set true if you want more info such as block hash...
    * @returns transaction details
    */

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async getTransaction(txId: string, options?: getTransactionOptions): Promise<TranCon> {
      if (PREFIXED_STD_TXID_REGEX.test(txId)) {
         txId = unPrefix0x(txId);
      }
      // TODO trow if txid does not match expected input

      const verbose = true; // by default getting transaction is in verbose mode
      const unTxId = unPrefix0x(txId);
      let params: any[] = [unTxId, 2];
      if (this.chainType === ChainType.DOGE) {
         params = [unTxId, true];
      }
      const res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getrawtransaction",
         params: params,
      });
      // Error codes https://github.com/bitcoin/bitcoin/blob/master/src/rpc/protocol.h
      if (utxo_check_expect_empty(res.data)) {
         throw new mccError(mccErrorCode.InvalidTransaction);
      }
      // It transaction number of confirmations is not at least 1, we got a transaction from mempool, we don't consider this transaction as valid
      if (res.data && res.data.result && res.data.result.confirmations && res.data.result.confirmations < 1) {
         throw new mccError(mccErrorCode.InvalidTransaction);
      }
      utxo_ensure_data(res.data);

      return new this.constructors.transactionConstructor(res.data.result);
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Client specific methods ////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   /**
    * Get header information about the block
    * @param blockHash
    * @returns
    */

   async getBlockHeaderBase(blockHashOrHeight: string | number): Promise<IUtxoGetBlockHeaderRes> {
      let blockHash: string | null = null;
      if (typeof blockHashOrHeight === "string") {
         blockHash = blockHashOrHeight as string;
         if (PREFIXED_STD_BLOCK_HASH_REGEX.test(blockHash)) {
            blockHash = unPrefix0x(blockHash);
         }
         // TODO match with some regex
      }
      if (typeof blockHashOrHeight === "number") {
         blockHash = await this.getBlockHashFromHeight(blockHashOrHeight as number);
      }
      const res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getblockheader",
         params: [blockHash],
      });
      if (utxo_check_expect_empty(res.data)) {
         throw new mccError(mccErrorCode.InvalidData);
      }
      utxo_ensure_data(res.data);
      return res.data.result;
   }

   /**
    * Get only tips of all the branches
    * @param height_gte
    * @returns
    */
   async getBlockTips(height_gte: number): Promise<BTipCon[]> {
      return this.getBlockTipsHelper(height_gte);
   }

   /**
    * Get block tips and full block chain for all tips (all of heir branches) for the last x blocks (defined bt branch_len parameter)
    * @param branch_len the branch length indicating how long can branches be
    * @returns Array of LiteBlocks
    */
   async getTopLiteBlocks(branch_len: number, read_main: boolean = true): Promise<BTipCon[]> {
      const height = await this.getBlockHeight();
      let callBranchLength: undefined | number = undefined;
      if (read_main) {
         callBranchLength = branch_len;
      }
      return this.getBlockTipsHelper(height - branch_len, callBranchLength);
   }

   /**
    * Get an array of all alternative chain tips
    * @returns
    */

   async getTopBlocks(option?: IUtxoGetAlternativeBlocksOptions): Promise<IUtxoGetAlternativeBlocksRes> {
      const res = await this.client.post(``, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getchaintips",
         params: [],
      });
      utxo_ensure_data(res.data);
      const gte_height = option?.height_gte || 0;
      const response = res.data.result.filter((el: IUtxoChainTip) => {
         return el.height >= gte_height;
      });

      if (option !== undefined) {
         if (option.all_blocks !== undefined) {
            let extended = response.map((el: IUtxoChainTip) => this.recursive_block_hash(el.hash, el.branchlen));
            extended = await Promise.all(extended);
            for (let i = 0; i < response.length; i++) {
               response[i].all_block_hashes = extended[i];
            }
         }
      }
      return response;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Client helper (private) methods ////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   /**
    * Get network info
    * @returns network info details
    */

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   private async getNetworkInfo(): Promise<any> {
      const res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getnetworkinfo",
         params: [],
      });
      // Error codes https://github.com/bitcoin/bitcoin/blob/master/src/rpc/protocol.h
      if (utxo_check_expect_empty(res.data)) {
         return null;
      }
      utxo_ensure_data(res.data);
      return res.data;
   }

   /**
    * Gets the block from main mining tip with provided height
    * @param blockNumber Block height
    * @returns Block hash
    */

   private async getBlockHashFromHeight(blockNumber: number): Promise<string> {
      const res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getblockhash",
         params: [blockNumber],
      });
      if (utxo_check_expect_block_out_of_range(res.data)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      utxo_ensure_data(res.data);
      return res.data.result as string;
   }

   /**
    *
    * @param height_gte
    * @param mainBranchProcess
    * @returns
    */

   private async getBlockTipsHelper(height_gte: number, mainBranchProcess?: number): Promise<BTipCon[]> {
      const tips = await this.getTopBlocks({ height_gte: height_gte, all_blocks: true });
      let mainBranchHashes: UtxoBlockTip[] = [];
      const activeTip = tips.filter((a) => a.status === "active")[0];
      const ActiveTip = new this.constructors.blockTipConstructor({
         hash: activeTip.hash,
         height: activeTip.height,
         branchlen: activeTip.branchlen,
         status: activeTip.status,
      });
      if (mainBranchProcess !== undefined) {
         mainBranchHashes = await this.recursive_block_tip(ActiveTip, mainBranchProcess);
      }
      const allTips = tips.map((UtxoTip: IUtxoChainTip) => {
         const tempTips = [];
         // all_block_hashes exist due to all_blocks: true in getTopBlocks call
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         for (let hashIndex = 0; hashIndex < UtxoTip!.all_block_hashes!.length; hashIndex++) {
            tempTips.push(
               new this.constructors.blockTipConstructor({
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  hash: UtxoTip!.all_block_hashes![hashIndex],
                  height: UtxoTip.height - hashIndex,
                  branchlen: UtxoTip.branchlen,
                  status: UtxoTip.status,
               })
            );
         }
         return tempTips;
      });
      // filter out duplicates
      const reducedTips = allTips.reduce((acc: BTipCon[], nev: BTipCon[]) => acc.concat(nev), []).concat(mainBranchHashes as BTipCon[]);
      const unique = new Set();
      return reducedTips.filter((elem: BTipCon) => {
         const key = `${elem.number}_${elem.blockHash}`;
         if (unique.has(key)) {
            return false;
         } else {
            unique.add(key);
            return true;
         }
      });
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Write part of RPC Client ///////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   // Not yet tested or used

   /**
    * Creates a new wallet on node's database
    * @param walletLabel label of your wallet used as a reference for future use
    * @returns name of the created wallet and possible warnings
    */
   /* istanbul ignore next */
   async createWallet(walletLabel: string): Promise<IUtxoWalletRes> {
      const res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "createwallet",
         params: [walletLabel],
      });
      utxo_ensure_data(res.data);
      // TODO try to import wallet if it already exists but is not imported
      return res.data.result;
   }

   /**
    * loads the wallet if it exist on node, but it has to be relisted
    * @param walletLabel wallet label to load
    * @returns
    */
   /* istanbul ignore next */
   async loadWallet(walletLabel: string): Promise<IUtxoWalletRes> {
      const res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "loadwallet",
         params: [walletLabel],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }

   /**
    *
    * @param walletLabel label of wallet, if you dont have one create one with createWallet
    * @param label label of address within wallet (default to "")
    * @param address_type type of address (default to "legacy") options = ["legacy", "p2sh-segwit", "bech32"]
    * @returns
    */
   /* istanbul ignore next */
   async createAddress(walletLabel: string, addressLabel: string = "", address_type: string = "legacy") {
      const res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getnewaddress",
         params: [addressLabel, address_type],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }

   /**
    * List all wallets on node
    * @returns
    */
   /* istanbul ignore next */
   async listAllWallets(): Promise<string[]> {
      const res = await this.client.post(``, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "listwallets",
         params: [],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }

   /**
    * List all addresses by their label on provided wallet
    * @param walletLabel label of the parent wallet we want to list addresses
    * @param addressLabel label of the addresses we want to list
    * @returns
    */
   /* istanbul ignore next */
   async listAllAddressesByLabel(walletLabel: string, addressLabel: string = ""): Promise<getAddressByLabelResponse[]> {
      const res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getaddressesbylabel",
         params: [addressLabel],
      });
      utxo_ensure_data(res.data);
      const address_labels = Object.keys(res.data.result);
      const response_array: getAddressByLabelResponse[] = [];
      for (const addL of address_labels) {
         response_array.push({ address: addL, purpose: res.data.result[addL].purpose });
      }
      return response_array;
   }

   /**
    * List all unspent transactions that happened between min and max blocks before current block
    * If we are in block 100 and set min to 10 and max to 40 we will get all transactions that happened
    * between block 60 and 90
    * @param walletLabel
    * @param min min block offset
    * @param max max block offset
    * @returns
    */
   /* istanbul ignore next */
   async listUnspentTransactions(walletLabel: string, min: number = 0, max: number = 1e6): Promise<IUtxoTransactionListRes[]> {
      const res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "listunspent",
         params: [min, max],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }
   /* istanbul ignore next */
   async createRawTransaction(walletLabel: string, vin: IIUtxoVin[], out: IIUtxoVout[]) {
      let voutArr = "[";
      let first = true;
      for (const i of out) {
         if (first) {
            first = false;
         } else {
            voutArr += ",";
         }
         const row = `{"${i.address}" : ${i.amount}}`;
         voutArr += row;
      }
      voutArr += "]";
      const VoutArr = JSON.parse(voutArr);
      const res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "createrawtransaction",
         params: [vin, VoutArr],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }
   /* istanbul ignore next */
   async signRawTransaction(walletLabel: string, rawTx: string, keysList: string[]) {
      const res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "signrawtransactionwithkey",
         params: [rawTx, keysList],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }

   /**
    * Send raw transaction
    * @param walletLabel the label of the wallet we are sending the transaction from
    * @param signedRawTx hash of signed transaction
    * @returns transaction sending status
    */
   /* istanbul ignore next */
   async sendRawTransaction(walletLabel: string, signedRawTx: string) {
      const res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "sendrawtransaction",
         params: [signedRawTx],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }

   /**
    * Send raw transaction and wait for it to be in next block
    * @param walletLabel the label of the wallet we are sending the transaction from
    * @param signedRawTx hash of signed transaction
    * @returns transaction sending status
    */
   /* istanbul ignore next */
   async sendRawTransactionInBlock(walletLabel: string, signedRawTx: string) {
      const res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "sendrawtransaction",
         params: [signedRawTx],
      });
      utxo_ensure_data(res.data);
      let tx = await this.getTransaction(res.data.result);
      while (res.data.blockhash) {
         await sleepMs(3000);
         tx = await this.getTransaction(res.data.result);
      }
      return res.data.result;
   }

   /**
    * Get private key from wallet
    * @notice Dont share this with anyone
    * @param walletLabel wallet label that owns the address
    * @param address
    * @returns private key
    */
   /* istanbul ignore next */
   async getPrivateKey(walletLabel: string, address: string) {
      const res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "dumpprivkey",
         params: [address],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Block tip recursive class methods //////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   async recursive_block_hash(hash: string, processHeight: number): Promise<string[]> {
      if (hash === "") {
         return [];
      }
      if (processHeight <= 1) {
         return [hash];
      } else {
         const Cblock = await this.getBlockHeader(hash);
         const hs = Cblock.previousBlockHash;
         return (await this.recursive_block_hash(hs, processHeight - 1)).concat([hash]);
      }
   }

   async recursive_block_tip(tip: BTipCon, processHeight: number): Promise<BTipCon[]> {
      if (tip.stdBlockHash === "") {
         return [];
      }
      const tempTip = new this.constructors.blockTipConstructor({
         hash: tip.stdBlockHash,
         height: tip.number,
         branchlen: tip.branchLen,
         status: tip.chainTipStatus,
      });
      if (processHeight <= 1) {
         return [tempTip];
      } else {
         const CurrBlock = await this.getBlockHeader(tip.stdBlockHash);
         const previousHash = CurrBlock.previousBlockHash;
         const previousHeight = CurrBlock.number - 1;
         return (
            await this.recursive_block_tip(
               new this.constructors.blockTipConstructor({
                  hash: previousHash,
                  height: previousHeight,
                  branchlen: tip.branchLen,
                  status: tip.chainTipStatus,
               }),
               processHeight - 1
            )
         ).concat([tempTip]);
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Regtest faucet part of RPC Client //////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   /**
    *
    * @dev Note that miner has to be registered in miner wallet
    * @dev only in regtest mode
    * @param address
    * @param amount
    * @returns
    */
   /* istanbul ignore next */
   async fundAddress(address: string, amount: number) {
      if (!this.inRegTest) {
         throw Error("You have to run client in regression test mode to use this ");
      }
      const res = await this.client.post(`wallet/miner`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "sendtoaddress",
         params: [address, amount],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }
}
