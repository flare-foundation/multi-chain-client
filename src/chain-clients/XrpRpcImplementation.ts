import axios, { AxiosRequestConfig } from "axios";
import { LedgerRequest } from "xrpl";
import { XrpBlock, XrpTransaction } from "..";
import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { ChainType, getTransactionOptions, RateLimitOptions, ReadRpcInterface, XrpMccCreate } from "../types";
import { MccLoggingOptionsFull } from "../types/genericMccTypes";
import { PREFIXED_STD_BLOCK_HASH_REGEX, PREFIXED_STD_TXID_REGEX } from "../utils/constants";
import { defaultMccLoggingObject, fillWithDefault, unPrefix0x } from "../utils/utils";
import { xrp_ensure_data } from "../utils/xrpUtils";

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
   maxRPS: 5,
};

export class XRPImplementation implements ReadRpcInterface {
   rippleApi: any;
   client: any;
   inRegTest: any;
   chainType: ChainType;
   loggingObject: MccLoggingOptionsFull;

   constructor(createConfig: XrpMccCreate) {
      const createAxiosConfig: AxiosRequestConfig = {
         baseURL: createConfig.url,
         timeout: createConfig.rateLimitOptions?.timeoutMs || DEFAULT_TIMEOUT,
         headers: { "Content-Type": "application/json" },
         validateStatus: function (status: number) {
            return (status >= 200 && status < 300) || status == 500;
         },
      };
      if (createConfig.username && createConfig.password) {
         createAxiosConfig.auth = {
            username: createConfig.username,
            password: createConfig.password,
         };
      }
      let client = axios.create(createAxiosConfig);
      this.client = axiosRateLimit(client, {
         ...DEFAULT_RATE_LIMIT_OPTIONS,
         ...createConfig.rateLimitOptions,
      });
      this.inRegTest = createConfig.inRegTest || false;
      this.loggingObject = createConfig.loggingOptions ? fillWithDefault(createConfig.loggingOptions) : defaultMccLoggingObject();

      this.chainType = ChainType.XRP;
   }

   async getTransaction(txId: string, options?: getTransactionOptions): Promise<XrpTransaction | null> {
      if (PREFIXED_STD_TXID_REGEX.test(txId)) {
         txId = unPrefix0x(txId);
      }
      const binary = options?.binary || false;
      const min_block = options?.min_block || undefined;
      const max_block = options?.max_block || undefined;
      interface XrpTxParams {
         transaction: string;
         binary: boolean;
         min_ledger?: number;
         max_ledger?: number;
      }
      let params: XrpTxParams = {
         transaction: txId,
         binary: binary,
      };
      if (min_block !== null && min_block !== null) {
         params.min_ledger = min_block;
         params.max_ledger = max_block;
      }
      try {
         let res = await this.client.post("", {
            method: "tx",
            params: [params],
         });
         xrp_ensure_data(res.data);
         return new XrpTransaction(res.data);
      } catch (e: any) {
         if (e.error === "txnNotFound") {
            return null;
         }
         throw e;
      }
   }

   async isHealthy(): Promise<boolean> {
      let res = await this.client.post("", {
         method: "server_info",
         params: [{}],
      });
      const validStates = ["full"];
      xrp_ensure_data(res.data);
      let state = res.data.result.info.server_state;
      if (this.loggingObject.mode === "develop") this.loggingObject.loggingCallback(state);
      return validStates.includes(state);
   }

   async getBlockHeight(): Promise<number> {
      let res = await this.client.post("", {
         method: "ledger_closed",
         params: [{}],
      });
      xrp_ensure_data(res.data);
      return res.data.result.ledger_index;
   }

   async getBlock(blockNumberOrHash: number | string): Promise<XrpBlock | null> {
      if (typeof blockNumberOrHash === "string") {
         if (PREFIXED_STD_BLOCK_HASH_REGEX.test(blockNumberOrHash)) {
            blockNumberOrHash = unPrefix0x(blockNumberOrHash);
         }
      }
      try {
         this.loggingObject.loggingCallback(`block number: ${blockNumberOrHash} `);

         let res = await this.client.post("", {
            method: "ledger",
            params: [
               {
                  ledger_index: blockNumberOrHash,
                  transactions: true,
                  expand: true,
                  binary: false,
               } as LedgerRequest,
            ],
         });
         xrp_ensure_data(res.data);
         return new XrpBlock(res.data);
      } catch (e: any) {
         if (e?.result?.error === "lgrNotFound") {
            return null;
         }
         if (e?.response?.status === 400) {
            return null;
         }
         throw new Error(e);
      }
   }

   // async getBlockHashFromHeight(blockNumber: number): Promise<string | null> {
   //    throw Error("Not Implemented");
   // }
}
