import BN from "bn.js";
import { MccClient } from "../module";
import { TransactionSuccessStatus } from "../types/genericMccTypes";

type SummaryBaseProps = {
    client?: MccClient;
};

export type BalanceDecreasingProps = SummaryBaseProps & {
    sourceAddressIndicator: string;
};

export type PaymentSummaryProps = SummaryBaseProps & {
    inUtxo: number;
    outUtxo: number;
};

export type paymentNonexistenceSummaryProps = SummaryBaseProps & {
    inUtxo: number;
};

export interface AddressAmount {
    address?: string;
    amount: BN;
    elementaryUnits?: BN; // if undefined the transaction elementaryUnits getter is the elementary unit
    utxo?: number;
}

interface TransactionSummaryBase<ST, TO> {
    status: ST;
    response?: TO;
}

export enum PaymentNonexistenceSummaryStatus {
    Success = "success",
    Coinbase = "coinbase",
    NotNativePayment = "notNativePayment",
    UnexpectedNumberOfParticipants = "unexpectedNumberOfParticipants",
    InvalidInUtxo = "invalidInUtxo",
    NoSpentAmountAddress = "noSpentAmountAddress",
    NoIntendedSpentAmountAddress = "noIntendedSpentAmountAddress",
    InvalidPkscript = "invalidPkscript",
}

export enum PaymentSummaryStatus {
    Success = "success",
    Coinbase = "coinbase",
    NotNativePayment = "notNativePayment",
    UnexpectedNumberOfParticipants = "unexpectedNumberOfParticipants",
    InvalidInUtxo = "invalidInUtxo",
    NoSpentAmountAddress = "noSpentAmountAddress",
    NoIntendedSpentAmountAddress = "noIntendedSpentAmountAddress",
    InvalidPkscript = "invalidPkscript",

    InvalidOutUtxo = "invalidOutUtxo",
    NoReceiveAmountAddress = "noReceiveAmountAddress",
    NoIntendedReceiveAmountAddress = "noIntendedReceiveAmountAddress",
}

export enum BalanceDecreasingSummaryStatus {
    Success = "success",
    InvalidInUtxo = "invalidInUtxo",
    NoSourceAddress = "noSourceAddress",
    NotValidSourceAddressFormat = "notValidSourceAddressFormat",
}

interface SummaryObjectBase {
    // blockNumber: number;
    blockTimestamp: number;
    transactionHash: string;
    sourceAddressHash: string;
    sourceAddress: string;
    spentAmount: BN;
    paymentReference: string;
    transactionStatus: TransactionSuccessStatus;
}

export interface PaymentSummaryObject extends SummaryObjectBase {
    receivingAddressHash: string;
    receivingAddress: string;
    receivedAmount: BN;

    intendedSourceAddressHash: string;
    intendedSourceAddress: string;
    intendedSourceAmount: BN;

    intendedReceivingAddressHash: string;
    intendedReceivingAddress: string;
    intendedReceivingAmount: BN;

    oneToOne: boolean;
    isFull: boolean;
}

export interface PaymentNonexistenceSummaryObject extends SummaryObjectBase {
    intendedSourceAddressHash: string;
    intendedSourceAddress: string;
    intendedSourceAmount: BN;

    isFull: boolean;
}

export interface BalanceDecreasingSummaryObject extends SummaryObjectBase {
    sourceAddressIndicator: string;
    isFull: boolean;
}

export type BalanceDecreasingSummaryResponse = TransactionSummaryBase<BalanceDecreasingSummaryStatus, BalanceDecreasingSummaryObject>;
export type PaymentSummaryResponse = TransactionSummaryBase<PaymentSummaryStatus, PaymentSummaryObject>;
export type PaymentNonexistenceSummaryResponse = TransactionSummaryBase<PaymentNonexistenceSummaryStatus, PaymentNonexistenceSummaryObject>;

export abstract class TransactionBase {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected privateData: any;
    // we can add additional data about transaction to this object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected privateAdditionalData: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(data: any, additionalData?: any) {
        this.privateData = data;
        this.privateAdditionalData = additionalData;
    }

    /**
     * Exposing the private data for the derived classes (dev only/python like privatization)
     */
    public get _data() {
        return this.privateData;
    }

    /**
     * Exposing the private data for the derived classes (dev only/python like privatization)
     */
    public get _additionalData() {
        return this.privateAdditionalData;
    }

    // Getters //

    /**
     * Transaction hash and TxId (for utxo hash and txid differ since segWit)
     */

    /**
     * Transaction ID
     */
    public abstract get txid(): string;

    /**
     * Flare specific standardized txid (hex encoded string of length 64 (32 bytes) without 0x prefix)
     */
    public abstract get stdTxid(): string;

    /**
     * Transaction Hash
     */
    public abstract get hash(): string;

    /**
     * Array of all references found in transactions
     */
    public abstract get reference(): string[];

    /**
     * Returns standardized payment reference, if it exists, or null reference.
     */
    public abstract get stdPaymentReference(): string; // Hex string

    /**
     * Returns unix timestamp of the transaction (block of the transaction).
     */
    public abstract get unixTimestamp(): number;

    /**
    Returns an array of all source addresses that are a source of native tokens.

    One or more of so returned addresses pay the fee

    * In account-based chains, only one address is present.
    * In UTXO chains, addresses indicate the addresses on relevant inputs.  
   
    Some addresses may be undefined, either due to non-existence on specific inputs or due to not being fetched from the outputs of the corresponding input transactions.
    */
    public abstract get sourceAddresses(): (string | undefined)[];

    /**
     * Array of a receiving addresses. In account-based chains only one address in present.
     * In UTXO chains, the list indicates the addresses on the corresponding transaction outputs.
     * Some may be undefined since outputs may not have addresses defined.
     */
    public abstract get receivingAddresses(): (string | undefined)[];

    /**
     * Gets transaction fee. In some cases it can revert, since fee is not possible to calculate.
     */
    public abstract get fee(): BN;

    /**
     * Gets transaction fee in elementary units (e.g. satoshi, microalgo, ...) and the address that paid the fee.
     */
    public abstract get feeSignerTotalAmount(): AddressAmount;

    /**
     * An array of spent amounts on transaction inputs.
     * In account-based chains, only one amount is present, and includes total spent amount, including fees.
     * In UTXO chains, the spent amounts on the corresponding inputs are given in the list.
     * If the corresponding addresses are undefined and not fetched (in `sourceAddresses`), the
     * corresponding spent amounts are 0.
     * The amounts are in basic units (e.g. satoshi, microalgo, ...)
     */
    public abstract get spentAmounts(): AddressAmount[];

    /**
     * On transactions that were successfully this is the same as `spentAmounts`.
     * On some chains transaction can be in block and fail, intended spent amount represents the amounts that were intended to be spent by each address.
     * Note: We only extract intended spent amounts for "nice" payment transactions that intend to transfer native tokens.
     */
    public abstract get intendedSpentAmounts(): AddressAmount[];

    // /**
    //  * An array of spent amounts in build-in assets tokens on transaction inputs.
    //  */
    // public abstract get assetSpentAmounts(): AddressAmount[];

    /**
     * An array of received amounts on transaction outputs.
     * In account based chains, only one input and output exist.
     * In UTXO chains ,the received amounts correspond to the amounts on outputs.
     */
    public abstract get receivedAmounts(): AddressAmount[];

    /**
     * On transactions that were successfully this is the same as `receivedAmounts`.
     * On some chains transaction can be in block and fail, intended received amount represents the amounts that were intended to be received by each address.
     * Note: We only extract intended received amounts for "nice" payment transactions that intend to transfer native tokens.
     */
    public abstract get intendedReceivedAmounts(): AddressAmount[];

    // /**
    //  * An array of received amounts in build-in tokens on transaction outputs.
    //  */
    // public abstract get assetReceivedAmounts(): AddressAmount[];

    /**
     * Returns transaction type as a string identifier. A set of types depends on a specific underlying chain.
     */
    public abstract get type(): string;

    /**
     * Indicates whether a payment is a native payment.
     */
    public abstract get isNativePayment(): boolean;

    /**
     * Currency name on the underlying chain.
     */
    public abstract get currencyName(): string;

    /**
     * Amount of elementary units that constitute one basic unit of currency on an underlying chain (e.g. 1 BTC = 10^8 satoshis)
     */
    public abstract get elementaryUnits(): BN;

    /**
     * Returns transaction success status.
     */
    public abstract get successStatus(): TransactionSuccessStatus;

    // methods //

    /**
     * Ensures that the transaction object has all the required information retrievable from current client
     * Make
     * @param client
     */
    public abstract makeFull(client: MccClient): Promise<void>;

    /**
     * Provides payment summary for a given transaction.
     * It can only do so for well structured "native" payments, that come from one address and goes to one address (utxo is a bit special).
     * If payment can be successfully summarized, the response will contain a `PaymentSummaryObject`. and status of `PaymentSummaryStatus.Success`.
     * If method throws exception only on critical occasions:
     * - connection to node is not stable or provided
     * - transaction data was corrupted when creating this object
     * - unhandled errors (usually indicates bugs in either this library or the underlying chain)
     * @param props.client : Initialized mcc client for the underlying chain
     * @param props.inUtxo : Vin index for utxo chains and ignored on non utxo chains
     * @param props.outUtxo : Vout index for utxo chains and ignored on non utxo chains
     */
    public abstract paymentSummary(props: PaymentSummaryProps): Promise<PaymentSummaryResponse>;

    /**
     * Provides balance decreasing summary for a given transaction.
     * Must be able to analyze any transaction, and provide a summary of the balance decreasing actions, that either reduce the given address balance or are signed by the given address.
     * If balance decreasing can be successfully summarized, the response will contain a `BalanceDecreasingSummaryObject` and status of `BalanceDecreasingSummaryStatus.Success`.
     * Method throws exception only on critical occasions if:
     * - connection to node is not stable or provided
     * - transaction data was corrupted when creating this object
     * - unhandled errors (usually indicates bugs in either this library or the underlying chain)
     * @param props.client : Initialized mcc client for the underlying chain
     * @param props.sourceAddressIndicator : AddressIndicator (vin index on utxo chains and standardized address hash on non utxo chains)
     */
    public abstract balanceDecreasingSummary(props: BalanceDecreasingProps): Promise<BalanceDecreasingSummaryResponse>;
}
