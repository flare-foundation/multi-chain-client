import { ALGOImplementation } from "./chain-clients/AlgoRpcImplementation";
import { BTCImplementation } from "./chain-clients/BtcRpcImplementation";
import { DOGEImplementation } from "./chain-clients/DogeRpcImplementation";
import { LTCImplementation } from "./chain-clients/LtcRpcImplementation";
import { XRPImplementation } from "./chain-clients/XrpRpcImplementation";
import { AlgoMccCreate, ChainType, ReadRpcInterface, UtxoMccCreate, XrpMccCreate } from "./types";

export module MCC {
   export class LTC extends LTCImplementation implements ReadRpcInterface {
      constructor(options: UtxoMccCreate) {
         super(options);
      }
   }

   export class BTC extends BTCImplementation implements ReadRpcInterface {
      constructor(options: UtxoMccCreate) {
         super(options);
      }
   }

   export class DOGE extends DOGEImplementation implements ReadRpcInterface {
      constructor(options: UtxoMccCreate) {
         super(options);
      }
   }

   export class XRP extends XRPImplementation implements ReadRpcInterface {
      constructor(options: XrpMccCreate) {
         super(options);
      }
   }

   export class ALGO extends ALGOImplementation implements ReadRpcInterface {
      constructor(options: AlgoMccCreate) {
         super(options);
      }
   }

   export function getChainType(chainIdOrName: number | string | ChainType) {
      switch (chainIdOrName) {
         case "XRP":
         case "RIPPLE":
         case ChainType.XRP:
            return ChainType.XRP;
         case "BTC":
         case ChainType.BTC:
            return ChainType.BTC;
         case "LTC":
         case ChainType.LTC:
            return ChainType.LTC;
         case "DOGE":
         case ChainType.DOGE:
            return ChainType.DOGE;
         case "ALGO":
         case "ALGORAND":
         case ChainType.ALGO:
            return ChainType.ALGO;
         default:
            return ChainType.invalid;
      }
   }

   export function getChainTypeName(chainIdOrName: ChainType) {
      switch (chainIdOrName) {
         case ChainType.XRP:
            return "XRP";
         case ChainType.BTC:
            return "BTC";
         case ChainType.LTC:
            return "LTC";
         case ChainType.DOGE:
            return "DOGE";
         case ChainType.ALGO:
            return "ALGO";
         default:
            return "invalid";
      }
   }

   export function Client(chainIdOrName: number | string | ChainType, options: AlgoMccCreate | UtxoMccCreate | XrpMccCreate) {
      const chainType = getChainType(chainIdOrName);
      switch (chainType) {
         case ChainType.XRP:
            return new XRP(options as XrpMccCreate);
         case ChainType.BTC:
            return new BTC(options as UtxoMccCreate);
         case ChainType.LTC:
            return new LTC(options as UtxoMccCreate);
         case ChainType.DOGE:
            return new DOGE(options as UtxoMccCreate);
         case ChainType.ALGO:
            return new ALGO(options as AlgoMccCreate);
         default: {
            throw new Error("Not implemented");
         }
      }
   }
}

// Object exports
export * from "./base-objects/BlockBase";
export * from "./base-objects/StatusBase";
export * from "./base-objects/TransactionBase";

// Utils exports
export * from "./utils/utils";
export * from "./utils/algoUtils";
export * from "./utils/xrpUtils";
export * from "./utils/utxoUtils";

// Constants
export * from "./utils/constants";

// Type reflection
export * from "./utils/typeReflection";

// retry logic
export * from "./utils/retry";

// managed
export * from "./utils/managed"

// trace
export * from "./utils/trace"

// Types
export * from "./types";

