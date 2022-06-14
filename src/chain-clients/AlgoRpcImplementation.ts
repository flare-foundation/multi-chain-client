import * as msgpack from "algo-msgpack-with-bigint";
import axios from "axios";
import { AlgoBlock, ReadRpcInterface } from "..";
import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { AlgoNodeStatus } from "../base-objects/StatusBase";
import { AlgoIndexerTransaction } from "../base-objects/TransactionBase";
import {
   AlgoMccCreate,
   ChainType,
   IAlgoGetBlockHeaderRes, IAlgoGetTransactionRes,
   IAlgoListTransactionRes,
   IAlgoLitsTransaction,
   IAlgoStatusRes,
   IAlgoTransaction,
   RateLimitOptions
} from "../types";
import { IAlgoBlockMsgPack, IAlgoCert, IAlgoGetStatus, IAlgoStatusObject } from "../types/algoTypes";
import { MccLoggingOptionsFull } from "../types/genericMccTypes";
import { algo_check_expect_block_out_of_range, algo_check_expect_empty, algo_ensure_data, hexToBase32, mpDecode } from "../utils/algoUtils";
import { PREFIXED_STD_TXID_REGEX } from "../utils/constants";
import { defaultMccLoggingObject, fillWithDefault, toCamelCase, toSnakeCase, unPrefix0x } from "../utils/utils";

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
   maxRPS: 5,
};

function algoResponseValidator(responseCode: number) {
   // allow any response, process them later in mcc
   return responseCode >= 200 && responseCode < 600;
}
export class ALGOImplementation implements ReadRpcInterface {
   algodClient: any;
   indexerClient: any;
   chainType: ChainType;
   inRegTest: boolean;
   loggingObject: MccLoggingOptionsFull;
   createConfig: AlgoMccCreate;

   constructor(createConfig: AlgoMccCreate) {
      this.createConfig = createConfig;
      const algodClient = axios.create({
         baseURL: createConfig.algod.url,
         timeout: DEFAULT_TIMEOUT,
         headers: {
            "Content-Type": "application/json",
            "X-Algo-API-Token": createConfig.algod.token,
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

      this.loggingObject = createConfig.loggingOptions ? fillWithDefault(createConfig.loggingOptions) : defaultMccLoggingObject();

      this.chainType = ChainType.ALGO;
   }

   /**
    * @deprecated
    * @returns
    */
   async isHealthy(): Promise<boolean> {
      let res = await this.algodClient.get("health"); // TODO all apps must be healthy
      const response_code = res.status;
      return response_code === 200;
   }

   async getStatus(): Promise<IAlgoStatusRes> {
      let res = await this.algodClient.get("v2/status");
      algo_ensure_data(res);
      return toCamelCase(res.data) as IAlgoStatusRes;
   }

   async getBlockHeaderCert(round: number): Promise<IAlgoCert> {
      let res = await this.algodClient.get(`/v2/blocks/${round}?format=msgpack`, {
         responseType: "arraybuffer",
         headres: { "Content-Type": "application/msgpack" },
      });
      algo_ensure_data(res);
      const decoded = msgpack.decode(res.data) as IAlgoGetBlockHeaderRes;
      return decoded.cert;
   }

   async getBlockHeader(round?: number): Promise<IAlgoGetBlockHeaderRes> {
      if (round === undefined) {
         const status = await this.getStatus();
         round = status.lastRound;
      }
      let resorig = await this.algodClient.get(`/v2/blocks/${round}`);
      // let res = await this.algodClient.get(`/v2/blocks/${round}?format=msgpack`, {responseType: 'arraybuffer', headres: {"Content-Type": "application/msgpack"}});

      // // application/msgpack
      // // responseEncoding: 'ascii',
      // // console.log(res.data);
      // const fs = require('fs')

      // // fs.writeFile('neki.txt', res.data, (err:any) => {
      // //     if (err) {
      // //       console.error(err)
      // //       return
      // //     }
      // //     //file written successfully
      // //   })

      // console.log(res.data)

      // const decoded = msgpack.decode(res.data)

      // // @ts-ignore
      // console.log(decoded);

      // console.log(resorig.data);

      // // hexToBase32()

      // // Block fees (base 32)
      // console.log("fees")
      // // @ts-ignore
      // console.log(hexToBase32(decoded.block.fees))
      // console.log(resorig.data.block.fees);

      // // @ts-ignore
      // console.log(decoded.block.fees)
      // console.log(Buffer.from(hexToBytes(base32ToHex(resorig.data.block.fees))));

      // // Block gh (base 64)
      // console.log("gh")
      // // @ts-ignore
      // console.log(hexToBase64(decoded.block.gh))
      // console.log(resorig.data.block.gh);

      // // @ts-ignore
      // console.log(decoded.block.gh)
      // console.log(Buffer.from(hexToBytes(base64ToHex(resorig.data.block.gh))));

      // // Block prev (base 32)
      // console.log("prev")
      // // @ts-ignore
      // console.log(hexToBase32(decoded.block.prev))
      // console.log(resorig.data.block.prev);
      // // unprefix blk-
      // console.log(resorig.data.block.prev.slice(4));

      // // @ts-ignore
      // console.log(decoded.block.prev)
      // console.log(Buffer.from(hexToBytes(base32ToHex(resorig.data.block.prev))));
      // // unprefix blk-
      // console.log(Buffer.from(hexToBytes(base32ToHex(resorig.data.block.prev.slice(4)))));

      // // Block rwd (base 32)
      // console.log("rwd")
      // // @ts-ignore
      // console.log(hexToBase32(decoded.block.rwd))
      // console.log(resorig.data.block.rwd);

      // // @ts-ignore
      // console.log(decoded.block.rwd)
      // console.log(Buffer.from(hexToBytes(base32ToHex(resorig.data.block.rwd))));
      // console.log(Buffer.from(hexToBytes(base32ToHex(resorig.data.block.rwd))).toString());

      // const hash = crypto.createHash('sha256')
      // // console.log(hash.digest('hex'));
      // hash.update(Buffer.from(hexToBytes(base32ToHex(resorig.data.block.rwd))).toString())
      // console.log(hash.digest('hex'));

      // // Block seed (base 64)
      // console.log("seed")
      // // @ts-ignore
      // console.log(hexToBase64(decoded.block.seed))
      // console.log(resorig.data.block.seed);

      // // @ts-ignore
      // console.log(decoded.block.seed)
      // console.log(Buffer.from(hexToBytes(base64ToHex(resorig.data.block.seed))));

      // // Block txn (base 64)
      // console.log("txn")
      // // @ts-ignore
      // console.log(hexToBase64(decoded.block.txn))
      // console.log(resorig.data.block.txn);

      // // @ts-ignore
      // console.log(decoded.block.txn)
      // console.log(Buffer.from(hexToBytes(base64ToHex(resorig.data.block.txn))));

      // // msgpack specific

      // // @ts-ignore
      // console.log(decoded.cert.prop.dig);
      // // @ts-ignore
      // console.log(hexToBase32(decoded.cert.prop.dig))

      algo_ensure_data(resorig);
      let responseData = toCamelCase(resorig.data) as IAlgoGetBlockHeaderRes;
      responseData.type = "IAlgoGetBlockHeaderRes";
      return responseData;
   }

   async getBlock(round?: number): Promise<AlgoBlock | null> {
      if (round === undefined) {
         const status = await this.getStatus();
         round = status.lastRound;
      }
      let res = await this.algodClient.get(`/v2/blocks/${round}?format=msgpack`, {
         responseType: "arraybuffer",
         headres: { "Content-Type": "application/msgpack" },
      });
      if (algo_check_expect_block_out_of_range(res)) {
         return null;
      }
      algo_ensure_data(res);
      const decoded = mpDecode(res.data);
      return new AlgoBlock(decoded as IAlgoBlockMsgPack);
   }

   async getBlockHeight(): Promise<number> {
      const blockData = await this.getBlockHeader();
      return blockData.block.rnd;
   }

   /**
    * Get trasnaction from node by its id
    * @param txid base32 encoded txid || standardized txid (prefixed or unprefixed)
    * @returns
    */
   async getTransaction(txid: string): Promise<AlgoIndexerTransaction | null> {
      if (!this.createConfig.indexer) {
         // No indexer
         return null;
      }
      if (PREFIXED_STD_TXID_REGEX.test(txid)) {
         txid = hexToBase32(unPrefix0x(txid));
      }
      let res = await this.indexerClient.get(`/v2/transactions/${txid}`);
      if (algo_check_expect_empty(res)) {
         return null;
      }
      algo_ensure_data(res);
      return new AlgoIndexerTransaction(toCamelCase(res.data) as IAlgoGetTransactionRes) as AlgoIndexerTransaction;
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

   /**
    * TODO implement
    */
   async getNodeStatus(): Promise<AlgoNodeStatus | null> {
      try {
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
      } catch (e) {
         return null;
      }
   }

   async getBottomBlockHeight(): Promise<number | null> {
      try {
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
      } catch (e) {
         return null;
      }
   }
}
