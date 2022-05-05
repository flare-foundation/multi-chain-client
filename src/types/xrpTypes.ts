import { LedgerResponse, TxResponse } from "xrpl";
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
