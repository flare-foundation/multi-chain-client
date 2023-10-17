import BN from "bn.js";
import { UtxoTransaction } from "./UtxoTransaction";
import { BTC_MDU, BTC_NATIVE_TOKEN_NAME } from "../../utils/constants";
import { toBN } from "../../utils/utils";

export class BtcTransaction extends UtxoTransaction {
    public get currencyName(): string {
        return BTC_NATIVE_TOKEN_NAME;
    }
    public get elementaryUnits(): BN {
        return toBN(BTC_MDU);
    }
}
