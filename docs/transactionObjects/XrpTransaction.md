# Ripple (XRP) Transaction

[Home](../README.md)

## Implementation of abstract methods

In the following documentation we will refer to response object of the RPC endpoint as `data`

### Hash / TxId / stdTxid

Each transaction response packs transaction hash as:

```javascript
this.data.result.hash;
```

### reference

For references we use [Memos Field](https://xrpl.org/transaction-common-fields.html#memos-field)s. This method returns the array of all `MemoData` fields from al Memo fields present in transaction.

### standardizedPaymentReference

If there is only one reference that is a representation of 32 byte hex string it is returned, otherwise 0 reference is returned

### unixTimestamp

Transaction network time we get from

```javascript
this.data.result.date;
```

Adjusted to UNIX timestamp in seconds from 1.1.1970 (instead of ripples 1.1.2000)

### sourceAddress

```javascript
[this.data.result.Account];
```

### receivingAddress

for transactions of type `Payment` we return

```javascript
[this.data.result.Destination];
```

### fee

fee used by transaction, always in XRP

```javascript
this.data.result.Fee;
```

### spentAmount

### receivedAmount

### type

One of the types from [documentation [1]](https://xrpl.org/transaction-types.html)

### isNativePayment

True: For all transactions where their type is `Payment` and the transfer is done in native currency (XRP)

### currencyName

XRP for native transactions

### elementaryUnits

10^(-6) to get from XRP -> elementary unit

### successStatus

The [following](https://xrpl.org/transaction-results.html) statuses should be considered

-  `0` - Success
   -  [`tesSUCCESS`](https://xrpl.org/tes-success.html)
-  `1` - Failure due to sender fault
   -  all other types of errors except the ones stated in the point below.
-  `2` - Failure due to receiver fault
   -  [`tecDST_TAG_NEEDED`](https://xrpl.org/tec-codes.html)
   -  [`tecNO_DST`](https://xrpl.org/tec-codes.html)
   -  [`tecNO_DST_INSUF_XRP`](https://xrpl.org/tec-codes.html)
   -  [`tecNO_PERMISSION`](https://xrpl.org/tec-codes.html)

## Resources

1. https://xrpl.org/transaction-types.html
