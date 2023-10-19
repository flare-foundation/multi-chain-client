import { UtxoTransaction } from "./UtxoTransaction";
import { BTC_MDU, BTC_NATIVE_TOKEN_NAME } from "../../utils/constants";

export class BtcTransaction extends UtxoTransaction {
    public get currencyName(): string {
        return BTC_NATIVE_TOKEN_NAME;
    }
    public get elementaryUnits(): number {
        return BTC_MDU;
    }
}
