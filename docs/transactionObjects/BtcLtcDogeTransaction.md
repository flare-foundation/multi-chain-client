# Bitcoin and its clones Transaction

[Home](../README.md)

To get transaction data from bitcoin node one must request it from the following RPC endpoint : [`getrawtransaction`](https://developer.bitcoin.org/reference/rpc/getrawtransaction.html), with TxId and verbose argument set to True.

Rpc client will return the Object with information about the transaction with TxId.

```json
{                                    (json object)
  "in_active_chain" : true|false,    (boolean) Whether specified block is in the active chain or not (only present with explicit "blockhash" argument)
  "hex" : "hex",                     (string) The serialized, hex-encoded data for 'txid'
  "txid" : "hex",                    (string) The transaction id (same as provided)
  "hash" : "hex",                    (string) The transaction hash (differs from txid for witness transactions)
  "size" : n,                        (numeric) The serialized transaction size
  "vsize" : n,                       (numeric) The virtual transaction size (differs from size for witness transactions)
  "weight" : n,                      (numeric) The transaction's weight (between vsize*4-3 and vsize*4)
  "version" : n,                     (numeric) The version
  "locktime" : xxx,                  (numeric) The lock time
  "vin" : [                          (json array)
    {                                (json object)
      "txid" : "hex",                (string) The transaction id
      "vout" : n,                    (numeric) The output number
      "scriptSig" : {                (json object) The script
        "asm" : "str",               (string) asm
        "hex" : "hex"                (string) hex
      },
      "sequence" : n,                (numeric) The script sequence number
      "txinwitness" : [              (json array)
        "hex",                       (string) hex-encoded witness data (if any)
        ...
      ]
    },
    ...
  ],
  "vout" : [                         (json array)
    {                                (json object)
      "value" : n,                   (numeric) The value in BTC
      "n" : n,                       (numeric) index
      "scriptPubKey" : {             (json object)
        "asm" : "str",               (string) the asm
        "hex" : "str",               (string) the hex
        "reqSigs" : n,               (numeric) The required sigs
        "type" : "str",              (string) The type, eg 'pubkeyhash'
        "addresses" : [              (json array)
          "str",                     (string) bitcoin address
          ...
        ]
      }
    },
    ...
  ],
  "blockhash" : "hex",               (string) the block hash
  "confirmations" : n,               (numeric) The confirmations
  "blocktime" : xxx,                 (numeric) The block time expressed in UNIX epoch time
  "time" : n                         (numeric) Same as "blocktime"
}

```

Bitcoin network is special in a sense that for some of the methods in our abstract object (fee, spend amount ...), we need to query more than just one transaction. This is due to UTXO nature of Bitcoin blockhain. The information about sending address is not provided in transaction, only the TxId and its output index that transaction is now spending, so in order to get the full information about the transaction one must query all transactions that are being spend by this transaction.

## Implementation of abstract methods

In the following documentation we will refer to response object of the RPC endpoint as `data`. Due to nature of this kind of UTXO chains, we also added `additionalData` object to that holds data about vout of transactions that are in `data.vin` array.

### txid: string and hash: string;

On Bitcoin network transaction hash and transaction id (TxId) are not always the same.
Since the introduction of SegWit hash and txId are calculated differently, the hash calculation does not include witness data, but TxId calculation does [[1](https://bitcoin.stackexchange.com/questions/77699/whats-the-difference-between-txid-and-hash-getrawtransaction-bitcoind),[2](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki)]

### TxId

```
data.txid
```

### Hash

```
data.hash
```

### reference

Transaction reference is calculated as a response of the OP_RETURN script [ [4](https://en.bitcoin.it/wiki/OP_RETURN)].
All of the outputs of this script create unspeakable txIds, but allow users to add arbitrary data to bitcoin network.
Note that transaction can have more than just one OP_RETURN vout script. For example each Coinbase transaction has more than one OP_RETURN output.

In this method we map over all vouts of transaction, filter out the ones that are OP_RETURN and return the data written in script (without he leading OP_RETURN byte-code)

### standardizedPaymentReference

If there is only one reference in transaction (on OP_RETURN script output), and the data of that transaction is a valid 32 byte hex string it is returned, otherwise zero reference is returned

### unixTimestamp

```
data.blocktime
```

### sourceAddress

In order to get source addresses of a transaction with TxId <ABC>, we must query the RPC for this transaction (`getrawtransaction <ABC> true`).
In this transaction we will get an array of all vins (transactions) spend by this transaction.
To get information about the address there are spending the founds with this transaction, one must query all vins of the <ABC> transaction, match provided vins in the vin array with vouts of connected transaction and get spending amount and address from there.

The implementation for

### receivingAddress

Receiving address list can be easily read from vout array provided in data object. Note that not all vouts are spendable outputs with provided address (OP_RETURN output scripts for example).
Note that even though each vout object can in theory have more that just one address, this in not used anymore, so we expect this array to only be ob length equal to 1.
This method return the map of `data.vout` array and take `vout.scriptPubKey.addresses[0]` for each element that has `scriptPubKey.addresses`

Each vout that has `scriptPubKey.addresses` can:

-  Have address array length not equal to 1
-  Have address array length of 1
   -  Have this one element equal to ''

### fee

The fee on bitcoin network is calculated as a difference between spend Amount and receivedAmount.
In order to calculate the fee of an transaction, one must query all vins of given transaction, sum their spend amounts and then subtract the sum of all vout amounts from this transaction. The difference is considered transaction Fee.

```
sum(spentAmount) - sum(receivedAmount)
```

### spentAmount

To create an spend amount Array one must query all transaction by TxIds in vin array in this transaction. Match their outputs with used vins in this transaction, and extract `vout.value` and `vout.scriptPubKey.addresses` from underlying transaction.

### receivedAmount

we extract this data from `data.vout` array, For each element in array that is not a script output we get amount as `vout.value`

### type

Bitcoin network by default ony supports one kind of transactions: `payment`

Mcc adds 3 more types of transactions so this method can return one of the following:

-  coinbase : transaction that mints new coins
-  payment : what you get from node
-  partial_payment : transaction with some vout of vins added to additional data
-  full_payment : transaction with vouts for all vins added to additional data

### isNativePayment

All transactions on bitcoin network are native payment transactions

### currencyName

Bitcoin: BTC
Litecoin: LTC
DOGECOIN: DOGE
### elementaryUnits

Satoshies: 10^(-8)
### successStatus

The status is always: `0` - Success.
## Resources

1. https://bitcoin.stackexchange.com/questions/77699/whats-the-difference-between-txid-and-hash-getrawtransaction-bitcoind
2. https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki
3. https://developer.bitcoin.org/reference/rpc/getrawtransaction.html
4. https://en.bitcoin.it/wiki/OP_RETURN
5. https://bitcoin.stackexchange.com/questions/29554/explanation-of-what-an-op-return-transaction-looks-like
6. https://bitcointalk.org/index.php?topic=5284627.0 // TODO
