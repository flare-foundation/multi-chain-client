import { IUtxoScriptPubKey } from "../../types";

interface IminimalDogeTx {
    txid: string;
    vin: Ivin[];
    vout: Ivout[];
    timestamp: number;
}

interface Ivin {
    vout: number;
    prevout: IprevOut;
}

interface IprevOut {
    value: number;
    scriptPubKey: IUtxoScriptPubKey;
}
interface Ivout {
    n: number;
    value: number;
    scriptPubKey: IUtxoScriptPubKey;
}
