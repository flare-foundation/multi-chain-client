# Ripple (XRP) Transaction

[Home](../README.md)

## Implementation of abstract methods

In the following documentation we will refer to response object of the RPC endpoint as `data`

### Hash

### TxId

### reference

### standardizedPaymentReference

### unixTimestamp

### sourceAddress

### receivingAddress

### fee

### spentAmount

### receivedAmount

### type

### isNativePayment

### currencyName

### elementaryUnits

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
