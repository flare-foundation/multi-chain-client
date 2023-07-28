import { BlockHeaderBase, BlockTipBase, XrpBlock, XrpFullBlock, XrpTransaction } from "./base-objects";
import { BTCImplementation } from "./chain-clients/BtcRpcImplementation";
import { DOGEImplementation } from "./chain-clients/DogeRpcImplementation";
import { XRPImplementation } from "./chain-clients/XrpRpcImplementation";
import { UtxoMccCreate, XrpMccCreate } from "./types";
import { ChainType, ReadRpcInterface } from "./types/genericMccTypes";

export type MccCreate = XrpMccCreate | UtxoMccCreate;

export module MCC {
   export class BTC extends BTCImplementation {
      constructor(options: UtxoMccCreate) {
         super(options);
      }
   }

   export class DOGE extends DOGEImplementation {
      constructor(options: UtxoMccCreate) {
         super(options);
      }
   }

   export class XRP extends XRPImplementation implements ReadRpcInterface<BlockTipBase, BlockHeaderBase, XrpBlock, XrpFullBlock, XrpTransaction> {
      constructor(options: XrpMccCreate) {
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
         case "DOGE":
         case ChainType.DOGE:
            return ChainType.DOGE;
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
         case ChainType.DOGE:
            return "DOGE";
         default:
            return "invalid";
      }
   }

   export function Client(chainIdOrName: number | string | ChainType, options: UtxoMccCreate | XrpMccCreate) {
      const chainType = getChainType(chainIdOrName);
      switch (chainType) {
         case ChainType.XRP:
            return new XRP(options as XrpMccCreate);
         case ChainType.BTC:
            return new BTC(options as UtxoMccCreate);
         case ChainType.DOGE:
            return new DOGE(options as UtxoMccCreate);
         default: {
            throw new Error("Not implemented");
         }
      }
   }
}

export type MccClient = MCC.XRP | MCC.DOGE | MCC.BTC;
export type MccUtxoClient = MCC.BTC | MCC.DOGE;
