interface ScriptPubKeyBasic {
    asm: string;
    hex: string;
    type?: string;
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
