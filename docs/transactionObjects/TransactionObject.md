# Base Transaction

[Home](../README.md)

On every Blockchain Network each block contains many transactions. Those transactions hold information about the state or its change. In order to read transactions with the same interfaces no mether the underlying chain.
For that we create an unified abstract object, that implements some abstract methods and needs to be implemented for every underlying chain to unify the data and makes it easier for user to query the data written transactions no mether the chain she or he is connecting to.

Transaction abstract object implements the following methods:

-  txid: string;
   - transaction id (unusually the same as hash)
-  stdTxid: string
   - Mcc standardized transaction id (hex encoded string of length 64 (32 bytes) without 0x prefix)
-  hash: string;
   -  Transaction hash and TxId (for utxo hash and txid differ since segWit)
-  reference: string[];
   -  Array of all references found in transactions
-  stdPaymentReference: string
   -  mcc standardized payment reference for flare
-  unixTimestamp: number;
   -  Transaction timestamp (usually the same as block timestamp that this transactions is a part of)
-  sourceAddresses: string[];
   -  Array of all source addresses
-  receivingAddresses: string[];
   -  Array of receiving addresses
-  fee: BN;
   -  Transaction fee (usually in native token) in elementary unit (MicroAlgos, ...)
-  spentAmounts: AddressAmount[];
   -  Full amount spend by transaction (usually in native token) in elementary unit (MicroAlgos, Satoshis ...)
-  receivedAmounts: AddressAmount[];
   -  Full amount received by receivingAddress in transaction (usually in native token) in elementary unit (MicroAlgos, Satoshis ...)
-  type: string;
   -  This is usually transaction type form underlying chain with some other added status responses added by mcc client
-  isNativePayment: boolean;
   -  Indicator whether this transaction is native payment transaction or not (may chains support other types of transactions, usually calls to smart contracts...)
-  currencyName: string;
   -  This can either be native token (such as BTC, XRP... or any other on chain token transfer or empty for non transfer transactions)
-  elementaryUnits: BN;
   -  The transfer rate from elementary unit to native units (10\*\*8 for Satoshi to Btc)
-  successStatus: TransactionSuccessStatus;
   -  Mcc defined transaction status
- paymentSummary(client?: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean): Promise<PaymentSummary>
   - mcc/flare defined transaction summary

AddressAmount objects implement the following interface

```
interface AddressAmount {
   address?: string;
   amount: BN;
   utxo?: number;
}
```

## TxId

Transaction id, used to identify transaction on blockchain, each txId is calculated from most of the data available abut the given transaction.

Output:

```
js  : string
mcc : 0x padded hex string
```

## Hash

Trasnaction hash, most of the time the same as TxId, different on BTC network and its clones due to segwit update.

Output:

```
js  : string
mcc : 0x padded hex string
```

## stdTxid

Flare specific standardized txid (hex encoded string of length 64 (32 bytes) without 0x prefix)

```
js  : string
mcc : hex encoded string of length 64 (32 bytes) without 0x prefix
```

## reference

Array of all references found in transactions

```
js  : string[]
mcc : /
```

## stdPaymentReference

 Returns standardized payment reference, if it exists, or null reference.

```
js  : string
mcc : hex encoded string of length 64 (32 bytes) with 0x prefix, default to 0x0...0
```

## unixTimestamp

Returns unix timestamp of the transaction (block of the transaction).

```
js  : number
mcc : unix timestamp (seconds since 1.1.1970)
```

## sourceAddresses

Returns a list of all source addresses. In account based chains only one address is present.
In UTXO chains addresses indicate the addresses on relevant inputs.
Some may be undefined, either due to non-existence on specific inputs or
due to not being fetched from the outputs of the corresponding input transactions.

```
js  : (string | undefined)[]
mcc : /
```

## receivingAddresses

Array of a receiving addresses. In account based chains only one address in present.
In UTXO chains the list indicates the addresses on the corresponding transaction outputs.
Some may be undefined since outputs may not have addresses defined.

```
js  : (string | undefined)[]
mcc : /
```

## fee 

Gets transaction fee. In some cases it can revert, since fee is not possible to calculate.

```
js  : BN
mcc : /
```

## spentAmounts 

A list of spent amounts on transaction inputs.
In account based chains only one amount is present, and includes total spent amount, including fees.
In UTXO chains the spent amounts on the corresponding inputs are given in the list.
If the corresponding addresses are undefined and not fetched (in `sourceAddresses`), the
corresponding spent amounts are 0.
The amounts are in basic units (e.g. satoshi, microalgo, ...)

```
AddressAmount {
   address?: string;
   amount: BN;
   utxo?: number;
}
js  : AddressAmount[]
mcc : /
```

## receivedAmounts 

A list of received amounts on transaction outputs.
In account based chains only one input and output exist.
In UTXO chains the received amounts correspond to the amounts on outputs.

```
AddressAmount {
   address?: string;
   amount: BN;
   utxo?: number;
}
js  : AddressAmount[]
mcc : /
```

## type

Returns transaction type as a string identifier. A set of types depends on a specific underlying chain.

```
js  : string
mcc : "coinbase" | "payment" | "partial_payment" | "full_payment"
```

## isNativePayment

Indicates whether a payment is a native payment.

```
js  : boolean
mcc : /
```

## currencyName

Currency name on the underlying chain.

```
js  : string
mcc : "BTC" | "LTC" | "DOGE" | "XRP" | "ALGO"
```

## elementaryUnits

Amount of elementary units that constitute one basic unit of currency on an underlying chain (e.g. 1 BTC = 10^8 satoshis)

```
js  : BN
mcc : (e.g. 1 BTC = 10^8 satoshis)
```

## successStatus

Returns transaction success status.

```
TransactionSuccessStatus = {
   SUCCESS = 0,
   SENDER_FAILURE = 1,
   RECEIVER_FAILURE = 2,
}
js  : TransactionSuccessStatus
mcc : /
```

## paymentSummary

`paymentSummary(client?: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean)`

a method to get unified information about transaction, can also process the transactions further, on some chains (BTC and BTC like) one needs to make additional queries to blockchain node to get all information
 
```
PaymentSummary {
   isNativePayment: boolean;
   sourceAddress?: string;
   receivingAddress?: string;
   spentAmount?: BN;
   receivedAmount?: BN;
   paymentReference?: string; // standardized payment reference, if it exists
   oneToOne?: boolean;
   isFull?: boolean;
}
js  : Promise<PaymentSummary>
mcc : /
```

# More?

For each individual implementation docs refer to one of the following

-  [BtcTransaction](./BtcLtcDogeTransaction.md)
-  [LtcTransaction](./BtcLtcDogeTransaction.md)
-  [DogeTransaction](./BtcLtcDogeTransaction.md)
-  [XrpTransaction](./XrpTransaction.md)
-  [AlgoTransaction](./AlgoTransaction.md)
