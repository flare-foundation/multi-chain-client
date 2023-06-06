import * as msgpack from "algo-msgpack-with-bigint";
import axios, { AxiosInstance } from "axios";
import { AlgoBlock, ReadRpcInterface } from "..";
import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { BlockTipBase, FullBlockBase } from "../base-objects/BlockBase";
import { AlgoNodeStatus } from "../base-objects/StatusBase";
import { AlgoTransaction } from "../base-objects/TransactionBase";
import { AlgoIndexerBlock } from "../base-objects/blocks/AlgoIndexerBlock";
import { AlgoIndexerTransaction } from "../base-objects/transactions/AlgoIndexerTransaction";
import {
   AlgoMccCreate,
   ChainType,
   IAlgoGetBlockHeaderRes,
   IAlgoIndexerAsset,
   IAlgoListTransactionRes,
   IAlgoLitsTransaction,
   IAlgoStatusRes,
   IAlgoTransaction,
   RateLimitOptions,
} from "../types";
import {
   IAlgoAssets,
   IAlgoBlockMsgPack,
   IAlgoCert,
   IAlgoGetIndexerBlockRes,
   IAlgoGetStatus,
   IAlgoGetTransactionRes,
   IAlgoStatusObject,
} from "../types/algoTypes";
import { algo_check_expect_block_out_of_range, algo_check_expect_empty, algo_ensure_data, certToInCert, mpDecode } from "../utils/algoUtils";
import { mccError, mccErrorCode } from "../utils/errors";
import { isPrefixed0x, toCamelCase, toSnakeCase, unPrefix0x } from "../utils/utils";

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
   maxRPS: 5,
};

function algoResponseValidator(responseCode: number) {
   // allow any response, process them later in mcc
   return responseCode >= 200 && responseCode < 600;
}
export class ALGOImplementation implements ReadRpcInterface {
   algodClient: AxiosInstance;
   indexerClient: AxiosInstance | undefined;
   chainType: ChainType;
   inRegTest: boolean;
   createConfig: AlgoMccCreate;

   constructor(createConfig: AlgoMccCreate) {
      this.createConfig = createConfig;
      const algodClient = axios.create({
         baseURL: createConfig.algod.url,
         timeout: DEFAULT_TIMEOUT,
         headers: {
            "Content-Type": "application/json",
            "X-Algo-API-Token": createConfig.algod.token,
            "x-api-key": createConfig.algod.token,
            "x-apikey": createConfig.apiTokenKey || "",
         },
         validateStatus: algoResponseValidator,
      });
      this.algodClient = axiosRateLimit(algodClient, {
         ...DEFAULT_RATE_LIMIT_OPTIONS,
         ...createConfig.rateLimitOptions,
      });

      if (createConfig.indexer) {
         const indexerClient = axios.create({
            baseURL: createConfig.indexer.url,
            timeout: DEFAULT_TIMEOUT,
            headers: {
               "Content-Type": "application/json",
               "X-Algo-API-Token": createConfig.indexer.token,
               "x-api-key": createConfig.indexer.token,
            },
            validateStatus: algoResponseValidator,
         });
         this.indexerClient = axiosRateLimit(indexerClient, {
            ...DEFAULT_RATE_LIMIT_OPTIONS,
            ...createConfig.rateLimitOptions,
         });
      }

      if (!createConfig.inRegTest) {
         this.inRegTest = false;
      } else {
         this.inRegTest = createConfig.inRegTest;
      }
      this.chainType = ChainType.ALGO;
   }
   getFullBlock(blockNumberOrHash: string | number): Promise<FullBlockBase<any>> {
      throw new Error("Method not implemented.");
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   getBlockTips?(height_gte: number): Promise<BlockTipBase[]> {
      throw new mccError(mccErrorCode.NotImplemented);
   }

   // eslint-disable-next-line @typescript-eslint/no-inferrable-types, @typescript-eslint/no-unused-vars
   getTopLiteBlocks(branch_len: number, read_main: boolean = true): Promise<BlockTipBase[]> {
      throw new mccError(mccErrorCode.NotImplemented);
   }

   /**
    * Return node status object for Algo node
    */

   async getNodeStatus(): Promise<AlgoNodeStatus> {
      const res = await this.algodClient.get("health");
      algo_ensure_data(res);

      const ver = await this.algodClient.get("versions");
      algo_ensure_data(ver);

      const statusRes = await this.algodClient.get("/v2/status");
      algo_ensure_data(statusRes);
      const status = toCamelCase(statusRes.data) as IAlgoGetStatus;

      const statusData = {
         health: res.status,
         status: status,
         versions: toCamelCase(ver.data),
      } as IAlgoStatusObject;

      return new AlgoNodeStatus(statusData);
   }

   async getBottomBlockHeight(): Promise<number> {
      const TopBlock = await this.getBlockHeight();
      let bottomBlockHeight = TopBlock;
      // check -1.000 -10.000 and -100.000 blocs
      for (let checkRound = 0; checkRound < 3; checkRound++) {
         bottomBlockHeight -= Math.pow(10, 3 + checkRound);
         let blc = await this.algodClient.get(`/v2/blocks/${bottomBlockHeight}`);

         if (blc.status !== 200) {
            // we didn't get block
            for (let i = 0; i < 10; i++) {
               bottomBlockHeight += Math.pow(10, 2 + checkRound);
               blc = await this.algodClient.get(`/v2/blocks/${bottomBlockHeight}`);
               if (blc.status === 200) {
                  break;
               }
            }
            // If we ever come here we are not healthy
         }
         // correct for 10 for delays
         if (TopBlock >= bottomBlockHeight + 10) {
            bottomBlockHeight += 10;
         }
      }
      return bottomBlockHeight;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Block methods //////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   async getBlock(round?: number): Promise<AlgoBlock> {
      if (round === undefined) {
         const status = await this.getStatus();
         round = status.lastRound;
      }
      const res = await this.algodClient.get(`/v2/blocks/${round}?format=msgpack`, {
         responseType: "arraybuffer",
         headers: { "Content-Type": "application/msgpack" },
      });
      if (algo_check_expect_block_out_of_range(res)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      algo_ensure_data(res);
      const decoded = mpDecode(res.data);
      return new AlgoBlock(decoded as IAlgoBlockMsgPack);
   }

   getBlockHeader(blockNumberOrHash?: number): Promise<AlgoBlock> {
      return this.getBlock(blockNumberOrHash);
   }

   async getBlockHeight(round?: number): Promise<number> {
      const blockData = await this.getBlockHeaderBase(round);
      return blockData.block.rnd;
   }

   async getBlockProof(round: number) {
      return await this.getBlockHeaderCert(round);
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Transaction methods ////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   /**
    * get Transaction cannot be called on algorand's algod client, use getIndexerTransaction instead or get transactions from block
    * @param txid
    */

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async getTransaction(txid: string): Promise<AlgoTransaction> {
      throw new mccError(mccErrorCode.InvalidMethodCall);
   }

   async listTransactions(options?: IAlgoLitsTransaction): Promise<IAlgoListTransactionRes | undefined> {
      if (!this.indexerClient) {
         // No indexer
         return undefined;
      }
      let snakeObject = {};
      if (options !== undefined) {
         snakeObject = toSnakeCase(options);
      }
      const res = await this.indexerClient.get(`/v2/transactions`, {
         params: snakeObject,
      });
      algo_ensure_data(res);
      const camelList = {
         currentRound: res.data["current-round"],
         nextToken: res.data["next-token"],
         transactions: [] as IAlgoTransaction[],
      };
      for (const key of Object.keys(res.data.transactions)) {
         camelList.transactions.push(toCamelCase(res.data.transactions[key]) as IAlgoTransaction);
      }
      return camelList as IAlgoListTransactionRes;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Build-in Assets (ASAs) methods /////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   async getAssetInfo(assetId: number): Promise<IAlgoAssets> {
      const res = await this.algodClient.get(`/v2/assets/${assetId}`);
      algo_ensure_data(res);
      return res.data as IAlgoAssets;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Client helper (private) methods ////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   private async getStatus(): Promise<IAlgoStatusRes> {
      const res = await this.algodClient.get("/v2/status");
      algo_ensure_data(res);
      return toCamelCase(res.data) as IAlgoStatusRes;
   }

   private async getBlockHeaderCert(round: number): Promise<IAlgoCert> {
      const res = await this.algodClient.get(`/v2/blocks/${round}?format=msgpack`, {
         responseType: "arraybuffer",
         headers: { "Content-Type": "application/msgpack" },
      });
      algo_ensure_data(res);
      const decoded = msgpack.decode(res.data) as IAlgoGetBlockHeaderRes;
      return decoded.cert;
   }

   private async getBlockHeaderBase(round?: number): Promise<IAlgoGetBlockHeaderRes> {
      if (round === undefined) {
         const status = await this.getStatus();
         round = status.lastRound;
      }
      const resorig = await this.algodClient.get(`/v2/blocks/${round}`);
      algo_ensure_data(resorig);
      const responseData = toCamelCase(resorig.data) as IAlgoGetBlockHeaderRes;
      responseData.type = "IAlgoGetBlockHeaderRes";
      return responseData;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Indexer specific methods  //////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   /**
    * Get trasnaction from node by its id
    * @param txid base32 encoded txid || standardized txid (prefixed or unprefixed)
    * @returns
    */
   async getIndexerTransaction(txid: string): Promise<AlgoIndexerTransaction | undefined> {
      if (!this.indexerClient) {
         return undefined;
      }
      if (isPrefixed0x(txid)) {
         txid = unPrefix0x(txid);
      }
      const res = await this.indexerClient.get(`/v2/transactions/${txid}`);
      if (algo_check_expect_empty(res)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      algo_ensure_data(res);
      return new AlgoIndexerTransaction(toCamelCase(res.data) as IAlgoGetTransactionRes) as AlgoIndexerTransaction;
   }

   async getIndexerBlock(round?: number): Promise<AlgoIndexerBlock | undefined> {
      if (!this.indexerClient) {
         return undefined;
      }
      if (!this.createConfig.indexer) {
         // No indexer
         throw new mccError(mccErrorCode.InvalidMethodCall);
      }
      if (round === undefined) {
         const status = await this.getStatus();
         round = status.lastRound - 1;
      }
      const res = await this.indexerClient.get(`/v2/blocks/${round}`);
      if (algo_check_expect_block_out_of_range(res)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      algo_ensure_data(res);
      const cert = await this.getBlockHeaderCert(round);
      const camelBlockRes = toCamelCase(res.data) as IAlgoGetIndexerBlockRes;
      camelBlockRes.transactions = [];
      for (const key of Object.keys(res.data.transactions)) {
         camelBlockRes.transactions.push(toCamelCase(res.data.transactions[key]) as IAlgoTransaction);
      }
      camelBlockRes.cert = certToInCert(cert);
      return new AlgoIndexerBlock(camelBlockRes);
   }

   async getIndexerAssetInfo(assetIndex: number): Promise<IAlgoIndexerAsset | undefined> {
      if (!this.indexerClient) {
         return undefined;
      }
      const res = await this.indexerClient.get(`/v2/assets/${assetIndex}`);
      if (algo_check_expect_empty(res)) {
         throw new mccError(mccErrorCode.InvalidResponse);
      }
      algo_ensure_data(res);
      return res.data.asset as IAlgoIndexerAsset;
   }
}
