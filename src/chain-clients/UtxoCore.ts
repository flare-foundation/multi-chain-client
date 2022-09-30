import axios from "axios";
import { UtxoBlock, UtxoTransaction } from "..";
import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { UtxoBlockHeader } from "../base-objects/blockHeaders/UtxoBlockHeader";
import { LiteBlock } from "../base-objects/blocks/LiteBlock";
import { UtxoBlockTip } from "../base-objects/blockTips/UtxoBlockTip";
import { UtxoNodeStatus } from "../base-objects/StatusBase";
import {
   getAddressByLabelResponse,
   getTransactionOptions,
   IIUtxoVin,
   IIUtxoVout,
   IUtxoTransactionListRes,
   IUtxoWalletRes,
   RateLimitOptions,
   UtxoMccCreate
} from "../types";
import { ChainType, ReadRpcInterface } from "../types/genericMccTypes";
import { IUtxoChainTip, IUtxoGetAlternativeBlocksOptions, IUtxoGetAlternativeBlocksRes, IUtxoGetBlockHeaderRes, IUtxoNodeStatus } from "../types/utxoTypes";
import { PREFIXED_STD_BLOCK_HASH_REGEX, PREFIXED_STD_TXID_REGEX } from "../utils/constants";
import { mccError, mccErrorCode } from "../utils/errors";
import { Managed } from "../utils/managed";
import { sleepMs, unPrefix0x } from "../utils/utils";
import { recursive_block_hash, recursive_block_tip, utxo_check_expect_block_out_of_range, utxo_check_expect_empty, utxo_ensure_data } from "../utils/utxoUtils";

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
   maxRPS: 5,
};

@Managed()
export class UtxoCore implements ReadRpcInterface {
   client: any;
   inRegTest: boolean;
   transactionConstructor: any;
   blockConstructor: any;
   chainType: ChainType;

   constructor(createConfig: UtxoMccCreate) {
      let client = axios.create({
         baseURL: createConfig.url,
         timeout: createConfig.rateLimitOptions?.timeoutMs || DEFAULT_TIMEOUT,
         headers: { "Content-Type": "application/json" },
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
      this.transactionConstructor = UtxoTransaction;
      this.blockConstructor = UtxoBlock;
      this.chainType = ChainType.BTC;
   }

   /**
    * Return node status object for Utxo nodes
    */

   async getNodeStatus(): Promise<UtxoNodeStatus> {
      let res = await this.getNetworkInfo();

      let infoRes = await this.client.post(``, {
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

   /**
    * Returns the block information
    * @param blockHashOrHeight Provide either block hash or height of the block
    * @returns All available block information
    */
   //
   async getBlock(blockHashOrHeight: string | number, retry = 3): Promise<UtxoBlock> {
      let blockHash: string | null = null;
      if (typeof blockHashOrHeight === "string") {
         blockHash = blockHashOrHeight as string;
      }
      if (typeof blockHashOrHeight === "number") {
         try {
            blockHash = await this.getBlockHashFromHeight(blockHashOrHeight as number);
         }
         catch (e) {
            throw new mccError(mccErrorCode.InvalidParameter);
         }
      }
      let params: any[] = [blockHash, 2];
      if (this.chainType === ChainType.DOGE) {
         params = [blockHash, true];
      }
      let res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getblock",
         params: params,
      });
      if (utxo_check_expect_block_out_of_range(res.data)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      utxo_ensure_data(res.data);
      return new this.blockConstructor(res.data.result);
   }

   async getBlockHeader(blockNumberOrHash: number | string | any): Promise<UtxoBlockHeader> {
      const header = await this.getBlockHeaderBase(blockNumberOrHash);
      return new UtxoBlockHeader(header)
   }

   /**
    * Get Block height (number of blocks) from connected chain
    * @returns block height (block count)
    */

   async getBlockHeight(): Promise<number> {
      let res = await this.client.post("", {
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

   async getTransaction(txId: string, options?: getTransactionOptions): Promise<UtxoTransaction> {
      if (PREFIXED_STD_TXID_REGEX.test(txId)) {
         txId = unPrefix0x(txId);
      }
      // TODO trow if txid does not match expected input

      let verbose = true; // by default getting transaction is in verbose mode
      let unTxId = unPrefix0x(txId);
      let res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getrawtransaction",
         params: [unTxId, verbose],
      });
      // Error codes https://github.com/bitcoin/bitcoin/blob/master/src/rpc/protocol.h
      if (utxo_check_expect_empty(res.data)) {
         throw new mccError(mccErrorCode.InvalidTransaction);
      }
      // It transaction number of confirmations is not at least 1, we got a transaction from mempool, we don't consider this transaction as valid
      if (res.data.result.confirmations < 1) {
         throw new mccError(mccErrorCode.InvalidTransaction);
      }
      utxo_ensure_data(res.data);
      return new this.transactionConstructor(res.data.result);
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
      let res = await this.client.post("", {
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

   async getBlockTips(height_gte: number): Promise<UtxoBlockTip[]> {
      return this.getBlockTipsHelper(height_gte);
   }

   /**
    * Get block tips and full block chain for all tips (all of heir branches) for the last x blocks (defined bt branch_len parameter)
    * @param branch_len the branch length indicating how long can branches be
    * @returns Array of LiteBlocks
    */

   async getTopLiteBlocks(branch_len: number): Promise<UtxoBlockTip[]> {
      const height = await this.getBlockHeight();
      return this.getBlockTipsHelper(height - branch_len, branch_len);
   }

   /**
    * Get an array of all alternative chain tips
    * @returns
    */

   async getTopBlocks(option?: IUtxoGetAlternativeBlocksOptions): Promise<IUtxoGetAlternativeBlocksRes> {
      let res = await this.client.post(``, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getchaintips",
         params: [],
      });
      utxo_ensure_data(res.data);
      const gte_height = option?.height_gte || 0;
      let response = res.data.result.filter((el: IUtxoChainTip) => {
         return el.height >= gte_height;
      });

      if (option !== undefined) {
         if (option.all_blocks !== undefined) {
            let extended = response.map((el: IUtxoChainTip) => recursive_block_hash(this, el.hash, el.branchlen));
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

   private async getNetworkInfo(): Promise<any> {
      let res = await this.client.post("", {
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
      let res = await this.client.post("", {
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

   private async getBlockTipsHelper(height_gte: number, mainBranchProcess?: number): Promise<UtxoBlockTip[]> {
      const tips = await this.getTopBlocks({ height_gte: height_gte, all_blocks: true });
      let mainBranchHashes: UtxoBlockTip[] = [];
      const activeTip = tips.filter((a) => a.status === "active")[0];
      const ActiveTip = new UtxoBlockTip({ hash: activeTip.hash, height: activeTip.height, branchlen: activeTip.branchlen, status: activeTip.status  });
      if (mainBranchProcess !== undefined) {
         mainBranchHashes = await recursive_block_tip(this, ActiveTip, mainBranchProcess);
      }
      const allTips = tips.map((UtxoTip: IUtxoChainTip) => {
         const tempTips = [];
         // all_block_hashes exist due to all_blocks: true in getTopBlocks call
         for (let hashIndex = 0; hashIndex < UtxoTip!.all_block_hashes!.length; hashIndex++) {
            tempTips.push(new UtxoBlockTip({ hash: UtxoTip!.all_block_hashes![hashIndex], height: UtxoTip.height - hashIndex, branchlen: UtxoTip.branchlen, status: UtxoTip.status}));
         }
         return tempTips;
      });
      // filter out duplicates
      const reducedTips = allTips.reduce((acc: UtxoBlockTip[], nev: UtxoBlockTip[]) => acc.concat(nev), []).concat(mainBranchHashes);
      const unique = new Set()
      return reducedTips.filter((elem: UtxoBlockTip) => {
         const key = `${elem.number}_${elem.blockHash}`
         if (unique.has(key)) {
            return false
         } else {
            unique.add(key)
            return true
         }

      })
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
      let res = await this.client.post("", {
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
      let res = await this.client.post("", {
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
      let res = await this.client.post(`wallet/${walletLabel}`, {
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
      let res = await this.client.post(``, {
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
      let res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getaddressesbylabel",
         params: [addressLabel],
      });
      utxo_ensure_data(res.data);
      let address_labels = Object.keys(res.data.result);
      let response_array: getAddressByLabelResponse[] = [];
      for (let addL of address_labels) {
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
      let res = await this.client.post(`wallet/${walletLabel}`, {
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
      for (let i of out) {
         if (first) {
            first = false;
         } else {
            voutArr += ",";
         }
         let row = `{"${i.address}" : ${i.amount}}`;
         voutArr += row;
      }
      voutArr += "]";
      let VoutArr = JSON.parse(voutArr);
      let res = await this.client.post(`wallet/${walletLabel}`, {
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
      let res = await this.client.post(`wallet/${walletLabel}`, {
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
      let res = await this.client.post(`wallet/${walletLabel}`, {
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
      let res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "sendrawtransaction",
         params: [signedRawTx],
      });
      utxo_ensure_data(res.data);
      let tx = await this.getTransaction(res.data.result);
      while (tx?.data.blockhash) {
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
      let res = await this.client.post(`wallet/${walletLabel}`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "dumpprivkey",
         params: [address],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
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
      let res = await this.client.post(`wallet/miner`, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "sendtoaddress",
         params: [address, amount],
      });
      utxo_ensure_data(res.data);
      return res.data.result;
   }
}
