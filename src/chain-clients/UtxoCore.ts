import axios from "axios";
import { UtxoBlock, UtxoTransaction } from "..";
import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { LiteBlock } from "../base-objects/blocks/LiteBlock";
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
import { ChainType, MccLoggingOptionsFull } from "../types/genericMccTypes";
import { IUtxoChainTip, IUtxoGetAlternativeBlocksOptions, IUtxoGetAlternativeBlocksRes, IUtxoGetBlockHeaderRes, IUtxoGetNetworkInfoRes } from "../types/utxoTypes";
import { PREFIXED_STD_BLOCK_HASH_REGEX, PREFIXED_STD_TXID_REGEX } from "../utils/constants";
import { defaultMccLoggingObject, fillWithDefault, getSimpleRandom, sleepMs, unPrefix0x } from "../utils/utils";
import { recursive_block_hash, recursive_block_tip, utxo_check_expect_block_out_of_range, utxo_check_expect_empty, utxo_ensure_data } from "../utils/utxoUtils";

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
   maxRPS: 5,
};

export class UtxoCore {
   client: any;
   inRegTest: boolean;
   transactionConstructor: any;
   blockConstructor: any;
   loggingObject: MccLoggingOptionsFull;
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

      this.loggingObject = createConfig.loggingOptions ? fillWithDefault(createConfig.loggingOptions) : defaultMccLoggingObject();

      // This has to be shadowed
      this.transactionConstructor = UtxoTransaction;
      this.blockConstructor = UtxoBlock;
      this.chainType = ChainType.BTC;
   }

   async isHealthy() {
      // WIP
      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Read part of RPC Client ////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   /**
    * Get network info
    * @returns network info details
    */
   async getNetworkInfo(retry = 0): Promise<any> {
      try {
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
      } catch (error) {
         if (retry === 0) {
            this.loggingObject.exceptionCallback(error, `UtxCore::getNetworkInfo() (failed after max retries)`);
            return null;
         }
         await sleepMs(100 + getSimpleRandom(500));
         this.loggingObject.exceptionCallback(error, `UtxCore::getNetworkInfo() (retry ${retry})`);

         return await this.getNetworkInfo(retry - 1);
      }
   }

   /**
    * Get transaction details
    * @param txId Transaction id
    * @param options provide verbose:boolean, set true if you want more info such as block hash...
    * @returns transaction details
    */
   async getTransaction(txId: string, options?: getTransactionOptions, retry = 3): Promise<UtxoTransaction | null> {
      if (PREFIXED_STD_TXID_REGEX.test(txId)) {
         txId = unPrefix0x(txId);
      }
      // TODO trow if txid does not match expected input
      try {
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
            return null;
         }
         utxo_ensure_data(res.data);
         return new this.transactionConstructor(res.data.result);
      } catch (error) {
         if (retry === 0) {
            this.loggingObject.exceptionCallback(error, `UtxCore::getTransaction(${txId}) (failed after max retries)`);
            return null;
         }
         await sleepMs(100 + getSimpleRandom(500));
         this.loggingObject.exceptionCallback(error, `UtxCore::getTransaction(${txId}) (retry ${retry})`);

         return await this.getTransaction(txId, options, retry - 1);
      }
   }

   /**
    * Get Block height (number of blocks) from connected chain
    * @returns block height (block count)
    */
   async getBlockHeight(retry = 3): Promise<number> {
      try {
         let res = await this.client.post("", {
            jsonrpc: "1.0",
            id: "rpc",
            method: "getblockcount",
            params: [],
         });
         utxo_ensure_data(res.data);
         return res.data.result;
      } catch (error) {
         if (retry === 0) {
            this.loggingObject.exceptionCallback(error, `UtxCore::getTransaction() (failed after max retries)`);
            return 0;
         }

         await sleepMs(100 + getSimpleRandom(500));

         this.loggingObject.exceptionCallback(error, `UtxCore::getTransaction() (retry ${retry})`);

         return await this.getBlockHeight(retry - 1);
      }
   }

   // async RTRgetBlockHeight(): Promise<number> {
   //    const baseFunc = async () => {
   //       let res = await this.client.post("", {
   //          jsonrpc: "1.0",
   //          id: "rpc",
   //          method: "getblockcount",
   //          params: [],
   //       });
   //       utxo_ensure_data(res.data);
   //       return res.data.result;
   //    };
   //    // return await retryTimes(baseFunc, 3, this.loggingObject.exceptionCallback);
   //    return await retry("RTRgetBlockHeight", baseFunc)
   // }

   /**
    * Get header information about the block
    * @param blockHash
    * @returns
    */
   async getBlockHeader(blockHashOrHeight: string | number, retry = 3): Promise<IUtxoGetBlockHeaderRes | null> {
      try {
         let blockHash: string | null = null;
         if (typeof blockHashOrHeight === "string") {
            blockHash = blockHashOrHeight as string;
            if (PREFIXED_STD_BLOCK_HASH_REGEX.test(blockHash)) {
               blockHash = unPrefix0x(blockHash);
            }
            // TODO match with some regex
         } else if (typeof blockHashOrHeight === "number") {
            blockHash = await this.getBlockHashFromHeight(blockHashOrHeight as number);
         }
         let res = await this.client.post("", {
            jsonrpc: "1.0",
            id: "rpc",
            method: "getblockheader",
            params: [blockHash],
         });
         if (utxo_check_expect_empty(res.data)) {
            return null;
         }
         utxo_ensure_data(res.data);
         return res.data.result;
      } catch (error) {
         if (retry === 0) {
            this.loggingObject.exceptionCallback(error, `UtxCore::getBlockHeader(${blockHashOrHeight}) (failed after max retries)`);
            return null;
         }

         await sleepMs(100 + getSimpleRandom(500));

         this.loggingObject.exceptionCallback(error, `UtxCore::getBlockHeader(${blockHashOrHeight}) (retry ${retry})`);

         return await this.getBlockHeader(blockHashOrHeight, retry - 1);
      }
   }

   /**
    * Gets the block from main mining tip with provided height
    * @param blockNumber Block height
    * @returns Block hash
    */
   async getBlockHashFromHeight(blockNumber: number): Promise<string | null> {
      let res = await this.client.post("", {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getblockhash",
         params: [blockNumber],
      });
      if (utxo_check_expect_block_out_of_range(res.data)) {
         return null;
      }
      utxo_ensure_data(res.data);
      return res.data.result as string;
   }

   /**
    * Returns the block information
    * @param blockHashOrHeight Provide either block hash or height of the block
    * @returns All available block information
    */
   async getBlock(blockHashOrHeight: string | number, retry = 3): Promise<UtxoBlock | null> {
      try {
         let blockHash: string | null = null;
         if (typeof blockHashOrHeight === "string") {
            blockHash = blockHashOrHeight as string;
         } else if (typeof blockHashOrHeight === "number") {
            blockHash = await this.getBlockHashFromHeight(blockHashOrHeight as number);
            if (blockHash === null) {
               return null;
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
            return null;
         }
         utxo_ensure_data(res.data);
         return new this.blockConstructor(res.data.result);
      } catch (error) {
         if (retry === 0) {
            this.loggingObject.exceptionCallback(error, `UtxCore::getBlock(${blockHashOrHeight}) (failed after max retries)`);
            return null;
         }

         await sleepMs(100 + getSimpleRandom(500));

         this.loggingObject.exceptionCallback(error, `UtxCore::getBlock(${blockHashOrHeight}) (retry ${retry})`);

         return await this.getBlock(blockHashOrHeight, retry - 1);
      }
   }

   async getBlockTipsHepler(height_gte: number, mainBranchProcess?: number) {
      // : Promise<BlockTip[]>{
      const tips = await this.getTopBlocks({ height_gte: height_gte, all_blocks: true });
      let mainBranchHashes: LiteBlock[] = [];
      const activeTip = tips.filter((a) => a.status === "active")[0];
      const ActiveTip = new LiteBlock({ hash: activeTip.hash, number: activeTip.height });
      if (mainBranchProcess !== undefined) {
         mainBranchHashes = await recursive_block_tip(this, ActiveTip, mainBranchProcess);
      }
      const allTips = tips.map((UtxoTip: IUtxoChainTip) => {
         const tempTips = [];
         if (UtxoTip.all_block_hashes) {
            for (let hashIndex = 0; hashIndex < UtxoTip.all_block_hashes.length; hashIndex++) {
               tempTips.push(new LiteBlock({ hash: UtxoTip.all_block_hashes[hashIndex], number: UtxoTip.height - hashIndex }));
            }
         }
         return tempTips;
      });
      return allTips.reduce((acc: LiteBlock[], nev: LiteBlock[]) => acc.concat(nev), []).concat(mainBranchHashes);
   }

   /**
    * Get only tips of all the branches
    * @param height_gte
    * @returns
    */
   async getBlockTips(height_gte: number) {
      return this.getBlockTipsHepler(height_gte);
   }

   async getTopLiteBlocks(branch_len: number) {
      const height = await this.getBlockHeight();
      return this.getBlockTipsHepler(height - branch_len, branch_len);
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

   /**
    * TODO implement
    */
   async getNodeStatus(): Promise<UtxoNodeStatus> {
      let res = await this.client.post(``, {
         jsonrpc: "1.0",
         id: "rpc",
         method: "getnetworkinfo",
         params: [],
      });
      utxo_ensure_data(res.data);

      console.log(res.data);
      
      return new UtxoNodeStatus(res.data.result as IUtxoGetNetworkInfoRes)
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Write part of RPC Client ///////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a new wallet on node's database
    * @param walletLabel label of your wallet used as a reference for future use
    * @returns name of the created wallet and possible warnings
    */
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
