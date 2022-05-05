[TOC](../README.md)

# Transaction status

Transactions on blockchains that get included into blocks may not be successful. For example, reverted transactions are included into Ethereum blocks. While providing attestation, attestation providers verify the status of a particular transaction. Depending on a blockchain, such transaction may be successful or fail due to various reasons. For the purpose of attestation, we are interested in only three categories:

-  `0` - **Success** - transaction is successful and payment was made.
-  `1` - **Failure due to sender** - transaction has failed but it is still included into a block and at least the fee was paid. The failure cannot be clearly attributed to the receiver.
-  `2` - **Failure due to receiver** - transaction has failed but it is still included into a block and at least the fee was paid. The failure can be clearly attributed to the receiver (e.g. bad destination address)
