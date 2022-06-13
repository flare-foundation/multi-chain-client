# Base Transaction

On every Blockchain Network each block contains many transactions. These transactions hold information about the blockchain state or its changes. The `TransactionBase` object allows modelling transactions with the same interface no matter the underlying chain. This object is a unified abstract object, that implements some abstract methods and needs to be implemented for every underlying chain. This makes it easier for users to query the data no matter the chain being connected to.

The transaction abstract object implements the following methods:

| Name: Type                                                                                                               | Description                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `txid: string`                                                                                                           | Transaction id (usually the same as hash)                                                                                                                      |
| `stdTxid: string`                                                                                                        | MCC standardized transaction id (hex encoded string of length 64 (32 bytes) without 0x prefix)                                                                 |
| `hash: string`                                                                                                           | Transaction hash and TxId (for UTXO hash and `txid` differ since segWit)                                                                                       |
| `reference: string[]`                                                                                                    | Array of all references found in transactions                                                                                                                  |
| `stdPaymentReference: string`                                                                                            | MCC standardized payment reference for Flare                                                                                                                   |
| `unixTimestamp: number`                                                                                                  | Transaction timestamp (usually the same as block timestamp that this transaction is a part of)                                                                 |
| `sourceAddresses: string[]`                                                                                              | Array of all source addresses                                                                                                                                  |
| `receivingAddresses: string[]`                                                                                           | Array of receiving addresses                                                                                                                                   |
| `fee: BN`                                                                                                                | Transaction fee (usually in native token) in elementary unit (MicroAlgos, ...)                                                                                 |
| `spentAmounts: AddressAmount[]`                                                                                          | Full amount spend by transaction (usually in native token) in elementary unit (MicroAlgos, Satoshis ...)                                                       |
| `receivedAmounts: AddressAmount[]`                                                                                       | Full amount received by `receivingAddress` in transaction (usually in native token) in elementary unit (MicroAlgos, Satoshis ...)                              |
| `type: string`                                                                                                           | This is usually transaction type from underlying chain with some other added status responses added by the MCC client                                          |
| `isNativePayment: boolean`                                                                                               | Indicator whether this transaction is native payment transaction or not (many chains support other types of transactions, usually calls to smart contracts...) |
| `currencyName: string`                                                                                                   | This can either be native token (such as BTC, XRP... or any other on chain token transfer or empty for non transfer transactions)                              |
| `elementaryUnits: BN`                                                                                                    | The transfer rate from elementary unit to native units (10^8 for Satoshi to BTC, for example)                                                                  |
| `successStatus: TransactionSuccessStatus`                                                                                | MCC defined transaction status                                                                                                                                 |
| `paymentSummary(client?: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean): Promise<PaymentSummary>` | MCC / Flare defined transaction summary                                                                                                                        |

`AddressAmount` objects implement the following interface:

```javascript
interface AddressAmount {
   address?: string;
   amount: BN;
   utxo?: number;
}
```

## `TxId`

Transaction id, used to identify a transaction on a blockchain, each `txId` is calculated from most of the data available about the given transaction.

Output:

```text
js  : string
mcc : 0x padded hex string
```

## `Hash`

Transaction hash, most of the time the same as `TxId`, different on BTC network and its clones due to the segwit update.

Output:

```text
js  : string
mcc : 0x padded hex string
```

## `stdTxid`

Flare-specific standardized `txId` (hex encoded string of length 64 (32 bytes) without 0x prefix).

```text
js  : string
mcc : hex encoded string of length 64 (32 bytes) without 0x prefix
```

## `reference`

Array of all references found in transactions.

```text
js  : string[]
mcc : /
```

## `stdPaymentReference`

Returns standardized payment reference, if it exists, or null reference.

```text
js  : string
mcc : hex encoded string of length 64 (32 bytes) with 0x prefix, default to 0x0...0
```

## `unixTimestamp`

Returns Unix timestamp of the transaction (block of the transaction).

```text
js  : number
mcc : unix timestamp (seconds since 1.1.1970)
```

## `sourceAddresses`

Returns a list of all source addresses. In account-based chains only one address is present.
In UTXO chains addresses indicate the addresses on relevant inputs.
Some addresses may be undefined, either due to non-existence on specific inputs or
due to not being fetched from the outputs of the corresponding input transactions.

```text
js  : (string | undefined)[]
mcc : /
```

## `receivingAddresses`

Array of a receiving addresses. In account-based chains only one address in present.
In UTXO chains the list indicates the addresses on the corresponding transaction outputs.
Some addresses may be undefined since outputs may not have addresses defined.

```text
js  : (string | undefined)[]
mcc : /
```

## `fee`

Gets transaction fee. In some cases it can revert, since fee is not possible to calculate.

```text
js  : BN
mcc : /
```

## `spentAmounts`

A list of spent amounts on transaction inputs.
In account-based chains only one amount is present, and includes total spent amount, including fees.
In UTXO chains the spent amounts on the corresponding inputs are given in the list.
If the corresponding addresses are undefined and not fetched (in `sourceAddresses`), the
corresponding spent amounts are 0.
The amounts are in basic units (e.g. satoshi, microalgo, ...)

```text
AddressAmount {
   address?: string;
   amount: BN;
   utxo?: number;
}
js  : AddressAmount[]
mcc : /
```

## `receivedAmounts`

A list of received amounts on transaction outputs.
In account -based chains only one input and output exist.
In UTXO chains the received amounts correspond to the amounts on outputs.

```text
AddressAmount {
   address?: string;
   amount: BN;
   utxo?: number;
}
js  : AddressAmount[]
mcc : /
```

## `type`

Returns transaction type as a string identifier. A set of types depends on a specific underlying chain.

```text
js  : string
mcc : "coinbase" | "payment" | "partial_payment" | "full_payment"
```

## `isNativePayment`

Indicates whether a payment is a native payment.

```text
js  : boolean
mcc : /
```

## `currencyName`

Currency name on the underlying chain.

```text
js  : string
mcc : "BTC" | "LTC" | "DOGE" | "XRP" | "ALGO"
```

## `elementaryUnits`

Amount of elementary units that constitute one basic unit of currency on an underlying chain (e.g. 1 BTC = 10^8 satoshis)

```text
js  : BN
mcc : (e.g. 1 BTC = 10^8 satoshis)
```

## `successStatus`

Returns transaction success status.

```javascript
TransactionSuccessStatus = {
   SUCCESS = 0,
   SENDER_FAILURE = 1,
   RECEIVER_FAILURE = 2,
}
js  : TransactionSuccessStatus
mcc : /
```

## `paymentSummary`

`paymentSummary(client?: MccClient, inUtxo?: number, utxo?: number, makeFullPayment?: boolean)`

A method to get unified information about a transaction, can also process the transactions further, on some chains (BTC and BTC like) one needs to make additional queries to blockchain node to get all information.

```javascript
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

## Derived types

Refer to the following docs for each individual implementation:

-  [BtcTransaction](./BtcLtcDogeTransaction.md)
-  [LtcTransaction](./BtcLtcDogeTransaction.md)
-  [DogeTransaction](./BtcLtcDogeTransaction.md)
-  [XrpTransaction](./XrpTransaction.md)
-  [AlgoTransaction](./AlgoTransaction.md)

[Back to home](../README.md)
