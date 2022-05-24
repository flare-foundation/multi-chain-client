import * as msgpack from "algo-msgpack-with-bigint";
import axios from "axios";
import { AlgoBlock, ReadRpcInterface } from "..";
import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { AlgoNodeStatus } from "../base-objects/StatusBase";
import { AlgoTransaction } from "../base-objects/TransactionBase";
import {
   AlgoMccCreate,
   ChainType,
   IAlgoGetBlockHeaderRes,
   IAlgoGetBlockRes,
   IAlgoGetTransactionRes,
   IAlgoListTransactionRes,
   IAlgoLitsTransaction,
   IAlgoStatusRes,
   IAlgoTransaction,
   RateLimitOptions
} from "../types";
import { IAlgoCert } from "../types/algoTypes";
import { MccLoggingOptionsFull } from "../types/genericMccTypes";
import { algo_check_expect_block_out_of_range, algo_check_expect_empty, algo_ensure_data, hexToBase32, hexToBase64 } from "../utils/algoUtils";
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

   constructor(createConfig: AlgoMccCreate) {
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
      decoded.cert.prop.dig = hexToBase64(decoded.cert.prop.dig);
      decoded.cert.prop.encdig = hexToBase64(decoded.cert.prop.encdig);
      decoded.cert.prop.oprop = hexToBase64(decoded.cert.prop.oprop);
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
         round = status.lastRound - 1;
      }
      let res = await this.indexerClient.get(`/v2/blocks/${round}`);
      if (algo_check_expect_block_out_of_range(res)) {
         return null;
      }
      algo_ensure_data(res);
      const cert = await this.getBlockHeaderCert(round);
      let camelBlockRes = toCamelCase(res.data) as IAlgoGetBlockRes;
      camelBlockRes.transactions = [];
      camelBlockRes.type = "IAlgoGetBlockRes";
      for (let key of Object.keys(res.data.transactions)) {
         camelBlockRes.transactions.push(toCamelCase(res.data.transactions[key]) as IAlgoTransaction);
      }
      camelBlockRes.cert = cert;
      return new AlgoBlock(camelBlockRes);
   }

   // async getBlockHashFromHeight(blockNumber: number): Promise<string | null> {
   //    let header = await this.getBlockHeader(blockNumber);
   //    if (header === null) {
   //       return null;
   //    } else {
   //       console.log(header.cert);
   //    }
   //    // throw Error("Not Implemented")
   //    return null;
   // }

   async getBlockHeight(): Promise<number> {
      const blockData = await this.getBlockHeader();
      return blockData.block.rnd;
   }

   /**
    * Get trasnaction from node by its id
    * @param txid base32 encoded txid || standardized txid (prefixed or unprefixed)
    * @returns
    */
   async getTransaction(txid: string): Promise<AlgoTransaction | null> {
      if (PREFIXED_STD_TXID_REGEX.test(txid)) {
         txid = hexToBase32(unPrefix0x(txid));
      }
      let res = await this.indexerClient.get(`/v2/transactions/${txid}`);
      if (algo_check_expect_empty(res)) {
         return null;
      }
      algo_ensure_data(res);
      return new AlgoTransaction(toCamelCase(res.data) as IAlgoGetTransactionRes) as AlgoTransaction;
   }

   async listTransactions(options?: IAlgoLitsTransaction): Promise<IAlgoListTransactionRes> {
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
    async getNodeStatus(): Promise<AlgoNodeStatus> {
      throw new Error("Method not implemented.");
   }
}
