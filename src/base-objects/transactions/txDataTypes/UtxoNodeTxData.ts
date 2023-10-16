interface UtxoTxData<T, S> {
    txid: string;
    hash?: string;
    version?: number;
    size?: number;
    vsize?: number;
    weight?: number;
    locktime?: number;
    fee?: number;
    blockhash?: string;
    confirmations?: number;
    time?: number;
    blocktime: number;
    hex?: string;
    vin: T[];
    vout: Vout<S>[];
}

interface Vout<S> {
    n: number;
    value: number;
    scriptPubKey: S;
}

interface ScriptPubKeyBasic {
    asm: string;
    hex: string;
    type?: string;
}

interface ScriptPubKeyBTC extends ScriptPubKeyBasic {
    reqSigs?: number;

    desc?: string;
    address?: string;
}

interface ScriptPubKeyDoge extends ScriptPubKeyBasic {
    reqSigs?: number;

    addresses?: string[];
}

interface ScriptPubKeyPrevout extends ScriptPubKeyBasic {
    address: string;
    desc?: string;
}

export interface VinCoinbase {
    coinbase: string;
    sequence?: number;
    txinwitness?: string[];
}

interface VinNormal {
    txid: string;
    vout: number;
    scriptSig?: UtxoScriptSig;
    txinwitness?: string[];
    sequence?: number;
}

export interface VinPrev extends VinNormal {
    prevout: Prevout;
}

interface Prevout {
    generated?: boolean;
    height?: number;
    value: number;
    scriptPubKey: ScriptPubKeyPrevout;
}

interface UtxoScriptSig {
    asm: string;
    hex: string;
}

export interface BtcTxData extends UtxoTxData<VinPrev | VinCoinbase, ScriptPubKeyBTC> {}

interface DogeIndexTxData extends UtxoTxData<VinPrev | VinCoinbase, ScriptPubKeyBTC> {}

interface DogeTxData extends UtxoTxData<VinNormal | VinCoinbase, ScriptPubKeyDoge> {}
