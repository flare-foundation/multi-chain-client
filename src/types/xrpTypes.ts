import { LedgerResponse, TxResponse } from "xrpl";
import { LedgerIndex } from "xrpl/dist/npm/models/common";
import { RateLimitOptions } from "../types";
import { optional } from "../utils/typeReflection";
import { IIGetBlockRes, IIGetTransactionRes, MccLoggingOptions } from "./genericMccTypes";

export class XrpMccCreate {
   url: string = "";
   @optional() username?: string = "";
   @optional() password?: string = "";
   @optional() inRegTest?: boolean = false;
   @optional() rateLimitOptions? = new RateLimitOptions();
   @optional() loggingOptions? = new MccLoggingOptions();
}

export interface XrpCreateAddressData {}

export interface IXrpGetTransactionRes extends IIGetTransactionRes, TxResponse {}

export interface IXrpGetFullTransactionRes extends IXrpGetTransactionRes {}
export interface IXrpGetBlockRes extends LedgerResponse, IIGetBlockRes {}

// TODO modify to lite version of get block
export interface IXrpGetBlockHeaderRes extends LedgerResponse, IIGetBlockRes {}

////
/**
 * Similar to AccountInfoRequest from xrpl
 */
export interface AccountInfoParamsObject {
   account: string;
   ledger_hash?: string;
   ledger_index?: LedgerIndex;
   queue?: boolean;
   signer_lists?: boolean;
   strict?: boolean;
}

// maybe one day https://github.com/ripple/rippled/issues/2457
export type AccountRootFlags =
   | "lsfDefaultRipple"
   | "lsfDepositAuth"
   | "lsfDisableMaster"
   | "lsfDisallowXRP"
   | "lsfGlobalFreeze"
   | "lsfNoFreeze"
   | "lsfPasswordSpent"
   | "lsfRequireAuth"
   | "lsfRequireDestTag";

export const FlagToHex = {
   lsfDepositAuth:    0x01000000,
   lsfDisableMaster:  0x00100000,
   lsfNoFreeze:       0x00200000,
   lsfGlobalFreeze:   0x00400000, 
   lsfDefaultRipple:  0x00800000,
   lsfPasswordSpent:  0x00010000,
   lsfRequireDestTag: 0x00020000,
   lsfRequireAuth:    0x00040000,
   lsfDisallowXRP:    0x00080000
}

export const HexToFlag = {
   0x01000000 : "lsfDepositAuth",
   0x00100000 : "lsfDisableMaster",
   0x00200000 : "lsfNoFreeze",
   0x00400000 : "lsfGlobalFreeze",
   0x00800000 : "lsfDefaultRipple",
   0x00010000 : "lsfPasswordSpent",
   0x00020000 : "lsfRequireDestTag",
   0x00040000 : "lsfRequireAuth",
   0x00080000 : "lsfDisallowXRP"
}