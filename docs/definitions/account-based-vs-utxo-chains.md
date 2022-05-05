[TOC](../README.md)

# Payment data models on blockchains

There are two major groups of data models in blockchains, the Unspent Transaction Output (UTXO) model and the account based model. Here we address implications of these two models in regard to [native payment](./native-payment.md) transactions (payments in native - or system - currency).

## Account based model

While considering native payment transactions, we prefer thinking in terms of classic banking wirings, where funds are sent from one account to another, where one transaction has unique source address and unique receiving address. Such a transaction is called _one-to-one_ payment. Account based blockchains resemble this analogy. Accounts are identified by addresses which in turn are obtained from private keys. Each account has a balance in native currency. A private key is used to control all native payment transactions that cause balance decrease, which can happen only through one-to-one (native) payments.

In an account based model, source address and receiving address are always uniquely defined. Spent amount is total amount leaving the source address and it includes the fee. Received amount is the amount the receiving address has received. The transaction is always considered as one-to-one transaction.

## UTXO model

In UTXO based blockchains multi-input and multi-output transactions are used. Each input and output are indicated by respective indices.
Outputs define to which addresses the funds are sent. If an output is not connected to an input of some transaction, it is deemed to be _unspent transaction output (UTXO)_. UTXOs are means of storing funds and are sent to an address. The holder of the private key corresponding to the address of the UTXO can authorize spending of the funds locked in an UTXO, by signing transactions that use the UTXO as an input. Hence, addresses can thus still be considered as accounts in the banking analogy described above.

### Bitcoin RPC API

In this discussion we will focus primarily on Bitcoin and clones (LTC, DOGE). These have nearly identical RPC API. RPC API returns transaction data, which contains data about outputs (`vout`), among them the receiving addresses. Transaction response has also the transaction input data (`vin`), which contain transaction id and its output index, as an identifier of the UTXO being used on the particular input. To obtain the source address, the transaction must be read by making an additional RPC API call and the relevant connected output should be read out.

In essence this means that for obtaining all input addresses for a Bitcoin transaction, one needs to make as many additional calls to RPC API as there are inputs to the transaction. For a specific block, one can read the data about the block and the transactions in the block with a single RPC API call. Counting the number of required transaction reads from RPC API for a Bitcoin block we can easily get over 20,000 reads per block. With reasonable limitations of say 50 calls/s on a RPC API, reading of all the transactions in a block together with all the input transactions could easily take several minutes.

### Source and receiving addresses for transactions

Due to multi-input-multi-output nature of UTXO blockchain transactions, complex ways of wiring funds are possible. However, we would still like to think of UTXO transactions in terms analogous to banking wirings.

In general, there is no definition of the "source address" or the "receiving address" in transactions on UTXO blockchains as funds can go from multiple addresses to multiple addresses. However, we might be interested in specific inputs and outputs. Indicating the input index of choice (`inUtxo`) and the output index (`utxo`) in an attestation request helps us in indicating the addresses of interest and thus defining unique the source address and the receiving address, for the purpose of the attestation.

Given an output of a transaction it can happen that the output has an address defined, empty or in rare cases even multiple addresses (a list of addresses). If the address is not defined or there is more then one address in the list, both cases are considered as the cases where the address does not exist. The address is considered to exist, only if there is exactly one address on the output. Note that some older Bitcoin transaction can have multiple addresses defined in output script. However, such transactions are not used anymore. MCC client does not support them.

### Payment summary

A payment summary provides a summary of the payment viewed as a transfer of funds from one address to another address. It summarizes the following things:

-  whether the transaction is a [native payment](./native-payment.md)
-  source address, if exists
-  receiving address
-  spent amount at source address, if exists
-  received amount at receiving address, if exists
-  standardised payment reference, if exists
-  whether the payment is one-to-one (see below)
-  whether the payment is considered as a full payment (see below)

In general, one can just view a transaction as taking from specific input and delivering to specific output.We call this a **partial payment**. Another alternative is to consider the indices `inUtxo` and `utxo` as pointers to the desired source and the receiving addresses, respectively. In a **full payment** we collect the amounts on all inputs that share the same source address (indicated by `inUtxo`) and subtract from the sum the total of output amounts returning to the same address. In this way we obtain the real (total) spent amount from the source address. Note that the spent amount of the transaction can be even net negative. Namely, funds can be taken from other addresses on other inputs and more funds can be returned to the selected source address.

Similarly, we can calculate net total received funds on the receiving address indicated by `utxo`, by summing all the amounts on the outputs that go to the receiving address and subtracting the sum of the amounts on all the inputs leaving the same address.

Most often, we are interested in "simple" transactions, from one address to another. Sending from one source address to a receiving address usually involves taking many inputs (as UTXOs) from a source address to be able to input a sufficient amount of funds into the transaction. On the output side, we would prefer to have at most two outputs, one being the receiving address and the other for returning the exceeding funds to the source address. Note that there could be several outputs to the receiving address as well. Such transactions emulate account based transactions where funds are taken from a single account and transferred to the single other account. These kinds of transactions are considered kind of special and we call them _one-to-one_ transactions. Note that such transaction may have additional non-value outputs (for example `OP_RETURN` output with payment reference).

One-to-one payments must necessarily be full payments.

### Indexing

As described above, reading all transactions in a block and then all input transactions for each transaction in the block can be quite heavy on RPC API service of a node. Depending on use cases, we may decide to do per transaction:

-  **full indexing** - once a transaction is read from the block, all input transactions on vins are also read and the corresponding outputs are stored as additional data. In such a way all input addresses can be obtained.
-  **partial indexing** - after a transaction is read from the block, input transactions on vins are not read.

In this context a relevant presentation for UTXO transaction is used, where a type of payment may be one of the following:

-  `full_payment` - all the corresponding outputs of the input transactions on the inputs are fetched (indexed)
-  `partial_payment`- some of the corresponding outputs of the input transactions on the inputs are fetched (indexed)
-  `payment` - none of the corresponding outputs of the input transactions on the inputs are fetched (indexed)
-  `coinbase` - coinbase transaction. No input addresses.

In the constest of attestation providers an indexer is used for indexing transactions from blocks. In this indexer only transactions with the [standardized payment reference](./payment-reference.md) are fully indexed and are thus considered as `full_payment` type.

Next: [Native payment](./native-payment.md)
