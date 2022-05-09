# Native payment

Blockchains may support different transactions. Each blockchain has a single currency that is used to pay fees for transactions. This is called the **native currency** of the blockchain (sometimes also called the **system currency**). Blockchains may support alternative currencies, which are usually called **tokens** and are considered as **application currencies**.

All blockchains we deal with in the attestation protocol support addresses which represent sources and targets for native currency transfers.
A **native payment** is a transaction on a blockchain that performs a native currency transfer of funds from one address to another. Specific definitions are provided below for each blockchain we deal with:

## Bitcoin, Litecoin, Dogecoin

Every transaction that ends up in a block is a native payment.

## Ripple

Native payments are transactions that meet the following conditions:

- Transaction must be of type `Payment`.
- Must be a direct XRP-to-XRP payment (not cross-currency payment, partial payment, or any other payment or transaction type).

## Algorand

Native payments are transactions that meet the following criteria:

- Transaction type must equal `pay`.

Next: [Payment reference](./payment-reference.md)

[Back to home](../README.md)
