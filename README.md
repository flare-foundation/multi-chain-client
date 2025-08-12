<p align="left">
  <a href="https://flare.network/" target="blank"><img src="https://content.flare.network/Flare-2.svg" width="410" height="106" alt="Flare Logo" /></a>
</p>

# Multi-Chain Client


MCC or Multi-Chain Client is a Typescript library that:
* allows querying nodes from any blockchain in a unified manner.
* Retrieved data is encapsulated in objects that hold all the original information and allow adding static, named properties.
* Implements a set of common methods used in FDC to calculate accounting information, such as balances, source and destination addresses, etc.

## Underlying nodes

We recommend to deploy nodes from our docker [repo](https://github.com/flare-foundation/connected-chains-docker)


## Development notes

[Want to contribute?](./CONTRIBUTING.md)


# How to use

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
