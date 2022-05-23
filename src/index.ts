import { ALGOImplementation } from "./chain-clients/AlgoRpcImplementation";
import { BTCImplementation } from "./chain-clients/BtcRpcImplementation";
import { DOGEImplementation } from "./chain-clients/DogeRpcImplementation";
import { LTCImplementation } from "./chain-clients/LtcRpcImplementation";
import { XRPImplementation } from "./chain-clients/XrpRpcImplementation";
import { AlgoMccCreate, ChainType, ReadRpcInterface, RPCInterface, UtxoMccCreate, XrpMccCreate } from "./types";

export module MCC {
   export class LTC extends LTCImplementation implements RPCInterface {
      constructor(options: UtxoMccCreate) {
         super(options);
      }
   }

   export class BTC extends BTCImplementation implements RPCInterface {
      constructor(options: UtxoMccCreate) {
         super(options);
      }
   }

   export class DOGE extends DOGEImplementation implements RPCInterface {
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
      constructor(createConfig: AlgoMccCreate) {
         super(createConfig);
      }
   }

   export function getChainType(chainIdOrName: number | string | ChainType) {
      if (chainIdOrName == null) {
         throw new Error("Chain missing");
      }
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
      if (chainIdOrName == null) {
         throw new Error("Chain missing");
      }
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
export * from "./base-objects/TransactionBase";

export * from "./types";

// Utils exports
export * from "./utils/algoUtils";
export * from "./utils/utils";
export * from './utils/xrpUtils'

// retry logic
export * from "./utils/retry";
