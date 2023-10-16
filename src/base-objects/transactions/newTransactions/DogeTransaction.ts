import BN from "bn.js";
import { BTC_MDU, DOGE_MDU, DOGE_NATIVE_TOKEN_NAME } from "../../../utils/constants";
import { toBN } from "../../../utils/utils";
import { UtxoFullTransaction } from "./UtxoTrancation";
import { ChainType } from "../../../types";

export class DogeTransaction extends UtxoFullTransaction {
    public get chain(): ChainType {
        return ChainType.DOGE;
    }

    public get currencyName(): string {
        return DOGE_NATIVE_TOKEN_NAME;
    }
    public get elementaryUnits(): BN {
        return toBN(DOGE_MDU);
    }
}
