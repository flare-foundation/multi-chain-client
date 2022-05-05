# Base block

[Home](../README.md)

The most basic part of any blockchain network are its blocks. The concept is known to pretty much all blockchain network, but even though the details about blocks on each chain are much different. Mcc client when querying blocks with `get block` it returns the chain specific block object, each block object implements in its own chain specific waz the following methods.

-  number: number;
   -  Block height, ie the number of blocks in the chain before this block
-  blockHash: string;
   -  block hash, unique to each block on the chain
-  stdBlockHash: string;
   -  what indexer saves to database, lowercase hex no 0x prefix of 32 bytes
-  unixTimestamp: number;
   -  block timestamp propagated on the chain
-  transactionIds: string[];
   -  array of all transaction hashes (txid)
-  stdTransactionIds: string[];
   -  array of hex no 0x prefix 32byte encoded transaction hashes
-  transactionCount: number;
   -  number of transactions in the block
