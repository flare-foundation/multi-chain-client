import { UtxoTransaction } from "./UtxoTransaction";
import { DOGE_MDU, DOGE_NATIVE_TOKEN_NAME } from "../../utils/constants";

export class DogeTransaction extends UtxoTransaction {
    public get currencyName(): string {
        return DOGE_NATIVE_TOKEN_NAME;
    }
    public get elementaryUnits(): number {
        return DOGE_MDU;
    }

    public get elementaryUnitsExponent(): number {
        return 8;
    }
}
