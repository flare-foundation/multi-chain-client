import * as msgpack from "algo-msgpack-with-bigint";
import axios from "axios";
import { AlgoBlock, ReadRpcInterface } from "..";
import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { AlgoIndexerBlock } from "../base-objects/blocks/AlgoIndexerBlock";
import { AlgoNodeStatus } from "../base-objects/StatusBase";
import { AlgoTransaction } from "../base-objects/TransactionBase";
import { AlgoIndexerTransaction } from "../base-objects/transactions/AlgoIndexerTransaction";
import {
   AlgoMccCreate,
   ChainType,
   IAlgoGetBlockHeaderRes,
   IAlgoListTransactionRes,
   IAlgoLitsTransaction,
   IAlgoStatusRes,
   IAlgoTransaction,
   RateLimitOptions
} from "../types";
import {
   IAlgoBlockMsgPack,
   IAlgoCert, IAlgoGetIndexerBlockRes,
   IAlgoGetStatus,
   IAlgoGetTransactionRes,
   IAlgoStatusObject
} from "../types/algoTypes";
import { algo_check_expect_block_out_of_range, algo_check_expect_empty, algo_ensure_data, certToInCert, mpDecode } from "../utils/algoUtils";
import { mccError, mccErrorCode } from "../utils/errors";
import { Managed } from "../utils/managed";
import { isPrefixed0x, toCamelCase, toSnakeCase, unPrefix0x } from "../utils/utils";

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
   maxRPS: 5,
};

function algoResponseValidator(responseCode: number) {
   // allow any response, process them later in mcc
   return responseCode >= 200 && responseCode < 600;
}
@Managed()
export class ALGOImplementation implements ReadRpcInterface {
   algodClient: any;
   indexerClient: any;
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

   /**
    * Return node status object for Algo node
    */

   async getNodeStatus(): Promise<AlgoNodeStatus> {
      let res = await this.algodClient.get("health");
      algo_ensure_data(res);

      let ver = await this.algodClient.get("versions");
      algo_ensure_data(ver);

      let status = await this.algodClient.get("/v2/status");
      algo_ensure_data(status);
      status = toCamelCase(status.data) as IAlgoGetStatus;

      const statusData = {
         health: res.status,
         status: status,
         versions: toCamelCase(ver.data),
      } as IAlgoStatusObject;

      return new AlgoNodeStatus(statusData);
   }

   async getBottomBlockHeight(): Promise<number> {
      let bottomBlockHeight = await this.getBlockHeight();

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
      let res = await this.algodClient.get(`/v2/blocks/${round}?format=msgpack`, {
         responseType: "arraybuffer",
         // , headres: { "Content-Type": "application/msgpack" },
      });
      if (algo_check_expect_block_out_of_range(res)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      algo_ensure_data(res);
      const decoded = mpDecode(res.data);
      return new AlgoBlock(decoded as IAlgoBlockMsgPack);
   }

   async getBlockHeight(round?: number): Promise<number> {
      const blockData = await this.getBlockHeader(round);
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

   async getTransaction(txid: string): Promise<AlgoTransaction> {
      throw new mccError(mccErrorCode.InvalidMethodCall);
   }

   async listTransactions(options?: IAlgoLitsTransaction): Promise<IAlgoListTransactionRes | null> {
      if (!this.createConfig.indexer) {
         // No indexer
         return null;
      }
      let snakeObject = {};
      if (options !== undefined) {
         snakeObject = toSnakeCase(options);
      }
      let res = await this.indexerClient.get(`/v2/transactions`, {
         params: snakeObject,
      });
      algo_ensure_data(res);
      let camelList = {
         currentRound: res.data["current-round"],
         nextToken: res.data["next-token"],
         transactions: [] as IAlgoTransaction[],
      };
      for (let key of Object.keys(res.data.transactions)) {
         camelList.transactions.push(toCamelCase(res.data.transactions[key]) as IAlgoTransaction);
      }
      return camelList as IAlgoListTransactionRes;
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // Client helper (private) methods ////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////

   private async getStatus(): Promise<IAlgoStatusRes> {
      let res = await this.algodClient.get("/v2/status");
      algo_ensure_data(res);
      return toCamelCase(res.data) as IAlgoStatusRes;
   }

   private async getBlockHeaderCert(round: number): Promise<IAlgoCert> {
      let res = await this.algodClient.get(`/v2/blocks/${round}?format=msgpack`, {
         responseType: "arraybuffer",
         headres: { "Content-Type": "application/msgpack" },
      });
      algo_ensure_data(res);
      const decoded = msgpack.decode(res.data) as IAlgoGetBlockHeaderRes;
      return decoded.cert;
   }

   private async getBlockHeader(round?: number): Promise<IAlgoGetBlockHeaderRes> {
      if (round === undefined) {
         const status = await this.getStatus();
         round = status.lastRound;
      }
      let resorig = await this.algodClient.get(`/v2/blocks/${round}`);
      algo_ensure_data(resorig);
      let responseData = toCamelCase(resorig.data) as IAlgoGetBlockHeaderRes;
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
   async getIndexerTransaction(txid: string): Promise<AlgoIndexerTransaction> {
      if (isPrefixed0x(txid)) {
         txid = unPrefix0x(txid);
      }
      let res = await this.indexerClient.get(`/v2/transactions/${txid}`);
      if (algo_check_expect_empty(res)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      algo_ensure_data(res);
      return new AlgoIndexerTransaction(toCamelCase(res.data) as IAlgoGetTransactionRes) as AlgoIndexerTransaction;
   }

   async getIndexerBlock(round?: number): Promise<AlgoIndexerBlock> {
      if (!this.createConfig.indexer) {
         // No indexer
         throw new mccError(mccErrorCode.InvalidMethodCall);
      }
      if (round === undefined) {
         const status = await this.getStatus();
         round = status.lastRound - 1;
      }
      let res = await this.indexerClient.get(`/v2/blocks/${round}`);
      if (algo_check_expect_block_out_of_range(res)) {
         throw new mccError(mccErrorCode.InvalidBlock);
      }
      algo_ensure_data(res);
      const cert = await this.getBlockHeaderCert(round);
      let camelBlockRes = toCamelCase(res.data) as IAlgoGetIndexerBlockRes;
      camelBlockRes.transactions = [];
      for (let key of Object.keys(res.data.transactions)) {
         camelBlockRes.transactions.push(toCamelCase(res.data.transactions[key]) as IAlgoTransaction);
      }
      camelBlockRes.cert = certToInCert(cert);
      return new AlgoIndexerBlock(camelBlockRes);
   }
}
