# Algorand (ALGO) transaction

[Home](../README.md)

## Implementation of abstract methods

In the following documentation we will refer to response object of the RPC endpoint as `data`

### Hash / txid

If transaction has id we return that in raw form (base32 encoded string)

```javascript
this.data.transaction.id;
```

### stdTxid

Transaction id converted to 32 byte hex string with 0x prefix (standardized txid)

### reference

array of note field if note field was added to transaction

### standardizedPaymentReference

if there is exactly one reference and it is a representation of 32 byte hex encoded string it is returned here, otherwise 0 reference is returned

### unixTimestamp

Transaction round time (block time of a block that transaction is a part of)

```javascript
this.data.transaction.roundTime;
```

### sourceAddress

Array of length 1 that is

```javascript
[this.data.transaction.sender];
```

### receivingAddress

depending on type of transaction

### fee

### spentAmount

### receivedAmount

### type

### isNativePayment

### currencyName

### elementaryUnits

### successStatus

## References

1. https://developer.algorand.org/docs/rest-apis/indexer/#transaction
