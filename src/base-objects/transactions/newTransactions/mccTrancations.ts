import { ChainType } from "../../../types";
import { BtcTransaction } from "./BtcTransaction";
import { DogeTransaction } from "./DogeTransaction";
import { XRPTransaction } from "./XRPTransaction";

export type fullMccTransaction = BtcTransaction | DogeTransaction | XRPTransaction;

export function isBtcTransaction(tx: fullMccTransaction): tx is BtcTransaction {
    return tx.chain == ChainType.BTC;
}

export function isDogeTransaction(tx: fullMccTransaction): tx is DogeTransaction {
    return tx.chain == ChainType.DOGE;
}

export function isXRPTransaction(tx: fullMccTransaction): tx is XRPTransaction {
    return tx.chain == ChainType.XRP;
}
