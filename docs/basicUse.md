# Basic Use

The most basic use of the MCC client is to query blocks and transactions from different blockchains. The code below demonstrates how to query a transaction from the Bitcoin and Algorand networks, showcasing the unification of query methods as well as the unification of responses.

In the MCC, connections to each blockchain are made through a different [MCC object](./mccClient/mccClient.md).

> **NOTE:**
> Networks are accessed through RPC endpoints that usually require some type of credentials.
> To start a connection credentials must be provided through the `MCCCreate` object, which is different depending on the connected chain.
>
> [Find more details here](./connectConfig.md).

Let's take a look at the minimal example to query a block and a transaction from the Bitcoin network by their height and transaction id (`txid`) respectively:

```javascript
// Configuration object
const connectConfig = {
   url: "https://myAwesomeBtcNode.com/",
   username: "user",
   password: "pass",
};

// MCC object used to connect to Bitcoin node
const MccClient = new MCC.BTC(connectConfig);

// Query block by its height
const block = await MccClient.getBlock(750_000);

// Log some details about the queried block
// Block height
console.log(block.number); // => 750000
// Block hash
console.log(block.blockHash); // => '<hash>'

// Query transaction
const transaction = await MccClient.getTransaction("<txid>");

// Log some details about the queried transaction
// Transaction timestamp
console.log(transaction.unixTimestamp); // => unixTimestamp
// Source addresses
console.log(transaction.sourceAddresses); // => [<address1>, <address2>, ...]
```

Now, to get block and transaction objects from a totally different blockchain such as Ripple, you only need to change the initialization of the MCC client, everything else remains the same.

```javascript
// Configuration object
const connectConfig = {
   url: "https://myAwesomeXrpNode.com/",
};

// MCC object used to connect to Ripple node
const MccClient = new MCC.XRP(connectConfig);

// Query block by its height
const block = await MccClient.getBlock(750_000);

// Log some details about the queried block
// Block height
console.log(block.number); // => 750000
// Block hash
console.log(block.blockHash); // => '<hash>'

// Query transaction
const transaction = await MccClient.getTransaction("<txid>");

// Log some details about the queried transaction
// Transaction timestamp
console.log(transaction.unixTimestamp); // => unixTimestamp
// Source addresses
console.log(transaction.sourceAddresses); // => [<address1>]
```

## For more information

-  See all available MCC clients and their methods in the [mccClient object](./mccClient/mccClient.md).

-  Learn about the full content of the [block object](./blockObjects/BlockObject.md).

-  Learn about the full content of the [transaction object](./transactionObjects/TransactionObject.md)

[Back to home](README.md)
