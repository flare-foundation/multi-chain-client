# Base block

The most basic part of any blockchain network are its blocks, even if the details about blocks on each chain are different. The MCC client when querying blocks with `get block` returns the chain specific block object. Each block object implements, in its own chain-specific way, the following properties:

| Name: Type                      | Description                                                                |
| ------------------------------- | -------------------------------------------------------------------------- |
| ``number: number``              | Block height, i.e. the number of blocks in the chain before this block.    |
| ``blockHash: string``           | Block hash, unique to each block on the chain.                             |
| ``stdBlockHash: string``        | What indexer saves to database, 32 bytes, lowercase hex without 0x prefix. |
| ``unixTimestamp: number``       | Block timestamp propagated on the chain.                                   |
| ``transactionIds: string[]``    | Array of all contained transaction hashes (``txid``).                      |
| ``stdTransactionIds: string[]`` | Array of 32 bytes, hex without 0x prefix encoded transaction hashes.       |
| ``transactionCount: number``    | Number of transactions in the block.                                       |

[Back  to home](../README.md)
