import BN from "bn.js";
import { UtxoTransaction } from "./UtxoTransaction";
import { toBN } from "../../utils/utils";
import { BTC_MDU, DOGE_NATIVE_TOKEN_NAME } from "../../utils/constants";

export class DogeTransaction extends UtxoTransaction {
    public get currencyName(): string {
        return DOGE_NATIVE_TOKEN_NAME;
    }
    public get elementaryUnits(): BN {
        return toBN(BTC_MDU);
    }
}
