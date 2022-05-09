# Flare MCC Docs

## What is the MCC?

MCC or Multi-Chain Client is a Typescript library that allows querying nodes from any blockchain in a unified manner. Retrieved data is encapsulated in objects that hold all the original information and allow adding static, named properties.

MCC supports blockchains directly, without requiring them to implement a specific API (as the [Rosetta API](https://www.rosetta-api.org/) does, for example). The currently supported blockchains are **Bitcoin**, **Litecoin**, **Dogecoin**, **Ripple** and **Algorand**.

Currently only [block](./blockObjects/BlockObject.md) and [transaction](./transactionObjects/TransactionObject.md) objects are supported.

## Table of contents

- [Basic use](./basicUse.md)
- [MCC connect config](./connectConfig.md)
- Limiting processor
- Blockchain essentials
  - [Data sources](./definitions/sources.md)
  - [Account-based vs. UTXO-based models](./definitions/account-based-vs-utxo-chains.md)
  - [Native payment](./definitions/native-payment.md)
  - [Payment reference](./definitions/payment-reference.md)
  - [Transaction status](./definitions/transaction-status.md)
- [Block objects](./blockObjects/BlockObject.md)
  - [BtcBlock](./blockObjects/BtcLtcDogeBlock.md)
  - [LtcBlock](./blockObjects/BtcLtcDogeBlock.md)
  - [DogeBlock](./blockObjects/BtcLtcDogeBlock.md)
  - [XrpBlock](./blockObjects/XrpBlock.md)
  - [AlgoBlock](./blockObjects/AlgoBlock.md)
- [Transaction objects](./transactionObjects/TransactionObject.md)
  - [BtcTransaction](./transactionObjects/BtcLtcDogeTransaction.md)
  - [LtcTransaction](./transactionObjects/BtcLtcDogeTransaction.md)
  - [DogeTransaction](./transactionObjects/BtcLtcDogeTransaction.md)
  - [XrpTransaction](./transactionObjects/XrpTransaction.md)
  - [AlgoTransaction](./transactionObjects/AlgoTransaction.md)
