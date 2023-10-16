import BN from "bn.js";
import { BTC_MDU, BTC_NATIVE_TOKEN_NAME } from "../../../utils/constants";
import { toBN } from "../../../utils/utils";
import { UtxoFullTransaction } from "./UtxoTrancation";

export class BtcTransaction extends UtxoFullTransaction {
    public get currencyName(): string {
        return BTC_NATIVE_TOKEN_NAME;
    }
    public get elementaryUnits(): BN {
        return toBN(BTC_MDU);
    }
}
