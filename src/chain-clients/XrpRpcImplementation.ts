import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { AccountInfoResponse, AccountTxResponse, LedgerResponse, ServerStateResponse } from "xrpl";
import axiosRateLimit from "../axios-rate-limiter/axios-rate-limit";
import { BlockHeaderBase, BlockTipBase } from "../base-objects/BlockBase";
import { XrpFullBlock } from "../base-objects/fullBlocks/XrpFullBlock";
import { mccSettings } from "../global-settings/globalSettings";
import { IAccountInfoRequest, IAccountTxRequest, XrpBlockReqParams, XrpMccCreate } from "../types";
import { PREFIXED_STD_BLOCK_HASH_REGEX, PREFIXED_STD_TXID_REGEX } from "../utils/constants";
import { mccError, mccErrorCode, mccOutsideError } from "../utils/errors";
import { mccJsonStringify, unPrefix0x } from "../utils/utils";
import { xrp_ensure_data } from "../utils/xrpUtils";
import { XrpBlock, XrpNodeStatus, XrpTransaction } from "../base-objects";
import { ChainType, ReadRpcInterface, getTransactionOptions } from "../types/genericMccTypes";
import { RateLimitOptions } from "../types/axiosRateLimitTypes";

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RATE_LIMIT_OPTIONS: RateLimitOptions = {
    maxRPS: 5,
};

export class XRPImplementation implements ReadRpcInterface<BlockTipBase, BlockHeaderBase, XrpBlock, XrpFullBlock, XrpTransaction> {
    client: AxiosInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inRegTest: any;
    chainType: ChainType;

    constructor(createConfig: XrpMccCreate) {
        const createAxiosConfig: AxiosRequestConfig = {
            baseURL: createConfig.url,
            timeout: createConfig.rateLimitOptions?.timeoutMs || DEFAULT_TIMEOUT,
            headers: { "Content-Type": "application/json", "x-apikey": createConfig.apiTokenKey || "" },
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
        const client = axios.create(createAxiosConfig);
        this.client = axiosRateLimit(client, {
            ...DEFAULT_RATE_LIMIT_OPTIONS,
            ...createConfig.rateLimitOptions,
        });
        this.inRegTest = createConfig.inRegTest || false;
        this.chainType = ChainType.XRP;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getBlockTips?(height_gte: number): Promise<BlockTipBase[]> {
        throw new mccError(mccErrorCode.NotImplemented);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTopLiteBlocks(branch_len: number, read_main: boolean = true): Promise<BlockTipBase[]> {
        throw new mccError(mccErrorCode.NotImplemented);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    listTransactions?(options?: any) {
        throw new mccError(mccErrorCode.NotImplemented);
    }

    /**
     * get NodeStatus object with information about node used to connect to underlying chain
     * @external_docs https://xrpl.org/server_state.html
     */

    async getNodeStatus(): Promise<XrpNodeStatus> {
        const res = await this.client.post("", {
            method: "server_state",
            params: [],
        });
        xrp_ensure_data(res.data);
        return new XrpNodeStatus(res.data as ServerStateResponse);
    }

    /**
     * Get the height of the block from which the underlying node holds the full history
     * @returns the block height of the first block in latest joined block set in node memory
     */

    async getBottomBlockHeight(): Promise<number> {
        const res = await this.client.post("", {
            method: "server_state",
            params: [],
        });
        xrp_ensure_data(res.data);
        try {
            const startBlocks = res.data.result.state.complete_ledgers.split(",").map((range: string) => Number(range.split("-")[0]));

            return startBlocks.sort((a: number, b: number) => b - a)[0];
        } catch (e) {
            throw new mccOutsideError(e);
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    // Block methods //////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    private async blockRequestBase(blockNumberOrHash: string | number, full: boolean) {
        const params: XrpBlockReqParams = {
            transactions: true,
            expand: full,
            binary: false,
            owner_funds: full,
        };
        if (typeof blockNumberOrHash === "string") {
            if (PREFIXED_STD_BLOCK_HASH_REGEX.test(blockNumberOrHash)) {
                blockNumberOrHash = unPrefix0x(blockNumberOrHash);
            }
            params.ledger_hash = blockNumberOrHash;
        } else {
            params.ledger_index = blockNumberOrHash;
        }
        mccSettings.loggingCallback(`block number: ${blockNumberOrHash} `);

        return await this.client.post<LedgerResponse>("", {
            method: "ledger",
            params: [params],
        });
    }

    async getFullBlock(blockNumberOrHash: string | number): Promise<XrpFullBlock> {
        try {
            const res = await this.blockRequestBase(blockNumberOrHash, true);
            xrp_ensure_data(res.data);
            return new XrpFullBlock(res.data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            // TODO: Invalid block error message (unify errors)
            throw new mccError(mccErrorCode.InvalidBlock);
            if (e.response?.status === 400) {
                throw new mccError(mccErrorCode.InvalidBlock);
            }
            throw e;
        }
    }

    async getBlock(blockNumberOrHash: number | string): Promise<XrpBlock> {
        try {
            const res = await this.blockRequestBase(blockNumberOrHash, false);
            xrp_ensure_data(res.data);
            return new XrpBlock(res.data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            // TODO: Invalid block error message (unify errors)
            throw new mccError(mccErrorCode.InvalidBlock);
            if (e.response?.status === 400) {
                throw new mccError(mccErrorCode.InvalidBlock);
            }
            throw e;
        }
    }

    getBlockHeader(blockNumberOrHash: number | string): Promise<XrpBlock> {
        return this.getBlock(blockNumberOrHash);
    }

    async getBlockHeight(): Promise<number> {
        // according to https://xrpl.org/basic-data-types.html#specifying-ledgers we must set ledger_index to "validated"
        const params: XrpBlockReqParams = {
            ledger_index: "validated",
        };
        const res = await this.client.post<LedgerResponse>("", {
            method: "ledger",
            params: [params],
        });
        xrp_ensure_data(res.data);
        return res.data.result.ledger_index;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    // Transaction methods ////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    async getTransaction(txId: string, options?: getTransactionOptions): Promise<XrpTransaction> {
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
        const params: XrpTxParams = {
            transaction: txId,
            binary: binary,
        };
        if (min_block) params.min_ledger = min_block;
        if (max_block) params.max_ledger = max_block;
        const res = await this.client.post("", {
            method: "tx",
            params: [params],
        });

        xrp_ensure_data(res.data);
        return new XrpTransaction(res.data);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    // Client specific methods ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     * @param account A unique identifier for the account, most commonly the account's Address.
     * @param upperBound either blockHash or block number for the upper bound (The information does not contain any changes from ledger versions newer than this one.)
     * @returns
     */

    async getAccountInfo(account: string, upperBound: number | string = "current"): Promise<AccountInfoResponse> {
        const params = {
            account: account,
            signer_lists: true,
        } as IAccountInfoRequest;
        if (typeof upperBound === "number") {
            params.ledger_index = upperBound;
        }
        if (upperBound === "current") {
            params.ledger_index = upperBound;
        } else if (typeof upperBound === "string") {
            params.ledger_hash = upperBound;
        }
        // AccountInfoRequest
        mccSettings.loggingCallback("Call Params");
        mccSettings.loggingCallback(mccJsonStringify(params));
        const res = await this.client.post("", {
            method: "account_info",
            params: [params],
        });
        xrp_ensure_data(res.data);
        return res.data;
    }

    async getAccountTransactions(account: string, lowerBound: number = -1, upperBound: number = -1): Promise<AccountTxResponse> {
        const params = {
            account: account,
        } as IAccountTxRequest;
        params.ledger_index_min = lowerBound;
        params.ledger_index_max = upperBound;
        mccSettings.loggingCallback(mccJsonStringify(params));
        const res = await this.client.post("", {
            method: "account_tx",
            params: [params],
        });
        xrp_ensure_data(res.data);
        return res.data;
    }
}
