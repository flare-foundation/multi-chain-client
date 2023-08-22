import { TransactionSuccessStatus } from "./genericMccTypes";
import BN from "bn.js";

export interface IAdditionalTxRequestOptions {
    getDataAvailabilityProof?: boolean;
    confirmations?: number;
}

export interface AdditionalTransactionDetails {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: any;
    blockNumber: BN;
    blockHash: string;
    blockTimestamp: BN;
    txId: string;
    sourceAddresses: string | string[][]; //
    destinationAddresses: string | string[][];
    paymentReference?: string | string[] | BN | BN[];
    spent: BN | BN[];
    delivered: BN | BN[];
    fee: BN;
    status: TransactionSuccessStatus;
}
