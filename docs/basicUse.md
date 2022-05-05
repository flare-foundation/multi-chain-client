[Home](README.md)

# Basic Use

The most basic use of mcc client is to query blocks and transactions from different blockchains. Since it is usually the best to show by example we will demonstrate how to query transaction from bitcoin network and algorand network and show the unification of query methods as well as the unification of responses we got.

First of all one need a RPC endpoint for the underlying chain that usually comes with some credentials. For each connection we can create a MCC object that is used to query the blockchain. To start a connection one must provide the credential packed as MCCCreate object. Since connecting to different nodes is not done the same the Create object differ depending on the connected chain.
More in detail documentation on how to connect to different chains can be found [here](./basicUse.md).

Lets look at the minimal example on how to query the transaction by its transaction id (txid) from bitcoin network
```javascript
// Configuration object
const connectConfig = {
   url:'https://myAwesomeBtcNode.com/',
   username: 'user',
   password: 'pass',
}

// Mcc object used to connect to Bitcoin node
const MccClient = new MCC.BTC(connectConfig);

// Query block by its height
const block = await MccClient.getBlock(750_000)

// use some detail about the queried block in code
// Block height 
console.log(block.number); // => 750000
// Block Hash
console.log(block.blockHash); // => '<hash>'

// Query transaction
const transaction = await MccClient.getTransaction('<txid>')

// use transaction details in code
// transaction timestamp
console.log(transaction.unixTimestamp); // => unixTimestamp
// source addresses
console.log(transaction.sourceAddresses); // => [<address1>, <address2>, ...]
```

Now to get block and transaction objects from totally different chain such as Ripple, in MCC we only have to modify the initialization of MCC client, all else stays the same.

```javascript
// Configuration object
const connectConfig = {
   url:'https://myAwesomeXrpNode.com/',
}

// Mcc object used to connect to Bitcoin node
const MccClient = new MCC.XRP(connectConfig);

// Query block by its height
const block = await MccClient.getBlock(750_000)

// use some detail about the queried block in code
// Block height 
console.log(block.number); // => 750000
// Block Hash
console.log(block.blockHash); // => '<hash>'

// Query transaction
const transaction = await MccClient.getTransaction('<txid>')

// use transaction details in code
// transaction timestamp
console.log(transaction.unixTimestamp); // => unixTimestamp
// source addresses
console.log(transaction.sourceAddresses); // => [<address1>]
```

Extended docs on all possible available Mcc clients and their methods can be found [here](./mccClient/mccClient.md)

To read more about the block responses docs can be found [here](./blockObjects/BlockObject.md)

To read more about transaction object responses docs can be found [here](./transactionObjects/TransactionObject.md)