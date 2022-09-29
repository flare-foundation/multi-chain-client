import BN from "bn.js";
import { MccClient, TransactionSuccessStatus } from "../types";

export type ITransaction = TransactionBase<any, any>;

export interface AddressAmount {
   address?: string;
   amount: BN;
   elementaryUnits?: BN; // if undefined the transaction elementaryUnits getter is the elementary unit
   utxo?: number;
}

export interface PaymentSummary {
   isNativePayment: boolean;
   isTokenTransfer?: boolean; // sometimes even no native payments can still be token transfers
   tokenElementaryUnits?: BN; // if it is a token transfer // not the same for all trasnactions with this token
   receivedTokenAmount?: BN; // only if token transfer
   tokenName?: string; // only if token transfer
   sourceAddress?: string;
   receivingAddress?: string;
   spentAmount?: BN;
   receivedAmount?: BN;
   paymentReference?: string; // standardized payment reference, if it exists
   oneToOne?: boolean;
   isFull?: boolean;
}

export interface TransactionBlock {
   hash?: string,
   id?: number
}

export abstract class TransactionBase<T, AT> {
   data: T;
   // we can add additional data about transaction to this object
   additionalData?: AT;

   constructor(data: T, additionalData?: AT) {
      this.data = data;
      this.additionalData = additionalData;
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
    Returns a array of all source addresses that are a source of native tokens.

    One or more of so returned addresses pay the fee

    * In account-based chains only one address is present.
    * In UTXO chains addresses indicate the addresses on relevant inputs.  
   
    Some addresses may be undefined, either due to non-existence on specific inputs or due to not being fetched from the outputs of the corresponding input transactions.
    */
   public abstract get sourceAddresses(): (string | undefined)[];

   /**
    Returns a array of all source addresses that are a source of build-in assets (currently only supported on ALGO and XRP). 
    * In account-based chains only one address is present.
    * In UTXO chains this feature is not supported

    WIP / TODO
    */
   public abstract get assetSourceAddresses(): (string | undefined)[];

   /**
    * Array of a receiving addresses. In account-based chains only one address in present.
    * In UTXO chains the list indicates the addresses on the corresponding transaction outputs.
    * Some may be undefined since outputs may not have addresses defined.
    */
   public abstract get receivingAddresses(): (string | undefined)[];

   /*
    Array of a receiving addresses that receive build in assets tokens.

    * In account-based chains only one address in present
      * Algo transactions that close to certain address list both receiving address and close address.
    * In UTXO chains this feature is not supported
    
    WIP / TODO

    Some addresses may be undefined since outputs may not have addresses defined.
    */
   public abstract get assetReceivingAddresses(): (string | undefined)[];

   /**
    * Gets transaction fee. In some cases it can revert, since fee is not possible to calculate.
    */
   public abstract get fee(): BN;

   /**
    * An array of spent amounts on transaction inputs.
    * In account-based chains only one amount is present, and includes total spent amount, including fees.
    * In UTXO chains the spent amounts on the corresponding inputs are given in the list.
    * If the corresponding addresses are undefined and not fetched (in `sourceAddresses`), the
    * corresponding spent amounts are 0.
    * The amounts are in basic units (e.g. satoshi, microalgo, ...)
    */
   public abstract get spentAmounts(): AddressAmount[];

   /**
    * An array of spent amounts in build-in assets tokens on transaction inputs.
    */
   public abstract get assetSpentAmounts(): AddressAmount[];

   /**
    * An array of received amounts on transaction outputs.
    * In account based chains only one input and output exist.
    * In UTXO chains the received amounts correspond to the amounts on outputs.
    */
   public abstract get receivedAmounts(): AddressAmount[];

   /**
    * An array of received amounts in build-in tokens on transaction outputs.
    */
   public abstract get assetReceivedAmounts(): AddressAmount[];

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

   public abstract paymentSummary(client?: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean): Promise<PaymentSummary>;
}

export { AlgoTransaction } from "./transactions/AlgoTransaction";
export { XrpTransaction } from "./transactions/XrpTransaction";
export { LtcTransaction } from "./transactions/LtcTransaction";
export { BtcTransaction } from "./transactions/BtcTransaction";
export { DogeTransaction } from "./transactions/DogeTransaction";
export { UtxoTransaction } from "./transactions/UtxoTransaction";
