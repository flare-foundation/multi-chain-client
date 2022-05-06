# Transaction status

Transactions on blockchains that get included into blocks may not be successful. For example, reverted transactions are included into Ethereum blocks. While providing attestation, attestation providers verify the status of a particular transaction. Depending on a blockchain, such transaction may be successful or fail due to various reasons. For the purpose of attestation, we are interested in only three categories:

| ID  | Status                      | Description                                      |
| --- | --------------------------- | ------------------------------------------------ |
| `0` | **Success**                 | Transaction was successful and payment was made. |
| `1` | **Failure due to sender**   | Transaction failed but it was still included in a block and the fee was paid. The failure cannot be clearly attributed to the receiver. |
| `2` | **Failure due to receiver** | Transaction failed but it was still included in a block and the fee was paid. The failure can be clearly attributed to the receiver (e.g. bad destination address) |

[Back to home](../README.md)
