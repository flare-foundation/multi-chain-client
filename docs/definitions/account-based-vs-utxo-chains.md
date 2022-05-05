[TOC](../README.md)

# Payment data models on blockchains

There are two major groups of data models in blockchains, the Unspent Transaction Output (UTXO) model and the account based model. Here we address implications of these two models in regard to [native payment](./native-payment.md) transactions (payments in native - or system - currency).

## Account based model

While considering native payment transactions, we prefer thinking in terms of classic banking wirings, where funds are sent from one account to another. Such a transaction has a unique source address and a unique receiving address and we consider it as **one-to-one** payment. Account based blockchains resemble this analogy. Accounts are identified by addresses which in turn are obtained from private keys. Each account has a balance in native currency. A private key is used to control every native payment transaction that can cause a balance decrease. 

In an account based model, the source address and the receiving address of a native payment transaction are always uniquely defined. The spent amount is the total amount leaving the source address and it includes the fee. The received amount is the amount the receiving address receives. The payment transaction is always considered as one-to-one payment. Note that usually there can exist transactions that are not native payments.

## UTXO based model

In UTXO based blockchains, multi-input and multi-output transactions are used. Each input and output are indicated by respective indices.
Outputs define to which addresses the funds are sent. If an output is not connected to an input of some transaction, it is deemed to be **unspent transaction output (UTXO)**. UTXOs are means of storing funds and they indicate the addresses to which the funds are sent. The holder of the private key corresponding to the address indicated in the UTXO can authorize spending of the funds locked in the UTXO, by signing the spending transaction that will use the UTXO as an input. Hence, addresses can thus still be considered as accounts in the banking analogy described above.

For better understanding of the Bitcoin UTXO model see [here](https://en.bitcoin.it/wiki/Transaction).

### Bitcoin RPC API

In this discussion we will focus primarily on Bitcoin and clones (LTC, DOGE). These have nearly identical RPC APIs. An RPC API returns transaction data, which contains data about outputs (array `vout`), each output containing the list of the receiving addresses. It also contains the transaction input data (array `vin`), where each input contains contains a transaction id and its output index, as an identifier of the UTXO being used on the particular input. To obtain the source address, the input transaction must be read by making an additional RPC API call and the relevant connected output should be read out.

In essence this means that for obtaining all the input addresses for a Bitcoin transaction, one needs to make as many additional calls to an RPC API as there are inputs to the transaction. For a specific block, one can read the data about the block and the transactions in the block with a single RPC API call. Counting the number of required transaction reads from RPC API for a Bitcoin block we can easily get over 20,000 reads per block. With reasonable limitations of say 50 calls/s on a RPC API, reading of all the transactions in a block, together with all the input transactions for each such transaction, could easily take several minutes.

For better understanding of Bitcoin RPC API see [here](https://developer.bitcoin.org/reference/rpc/index.html) (specifically [getrawtransaction](https://developer.bitcoin.org/reference/rpc/getrawtransaction.html) method).

### Source and receiving addresses for transactions

Due to multi-input-multi-output nature of UTXO blockchain transactions, complex ways of wiring funds are possible. However, we would still like to think of UTXO transactions in terms analogous to banking wirings.

In general, there is no definition of the "source address" or the "receiving address" in transactions on UTXO blockchains as funds can go from multiple addresses to multiple addresses. However, we might be interested in specific inputs and outputs. Providing the input index of choice (`inUtxo`) and the output index (`utxo`) one can define the source and the receiving address of our interest. Note that addresses can be read from transaction outputs only, and a transaction output can have 0 or more addresses defined. Hence the unique definition of the source and the receiving address is possible only in cases where the corresponding outputs have exactly 1 address defined.

### Payment summary

A payment summary is an aggregate that provides a summary of a native payment transaction viewed as a transfer of funds from one address to another. It summarizes the following things:

-  whether the transaction is a [native payment](./native-payment.md),
-  the source address, if exists,
-  the receiving address, if exists,
-  the spent amount at the source address, if exists,
-  the received amount at the receiving address, if exists,
-  standardised payment reference, if exists,
-  whether the payment is one-to-one,
-  whether the payment is considered as a full payment (see below)

In general, one can just view a transaction as taking from a specific input (index `inUtxo`) and delivering to the specific output (index `utxo`). We call this a **partial payment**. Another alternative is to consider the indices `inUtxo` and `utxo` as the pointers to the desired source and the receiving addresses, respectively. In a **full payment** we collect the total of the amounts on all inputs that share the same source address and subtract from the total the sum of output amounts returning to the same address. In this way we obtain the real (total) spent amount from the source address. Note that the spent amount of the transaction can be even net negative. Namely, funds can be taken from other addresses on other inputs and more funds can be returned to the selected source address.

Similarly, we can calculate net total received funds on the receiving address indicated by `utxo`, by summing all the amounts on the outputs that go to the receiving address and subtracting the sum of the amounts on all the inputs leaving the same address.

Most often, we are interested in "simple" transactions, from one address to another. Sending from one source address to a receiving address usually involves taking many inputs (as UTXOs) from the source address, in order to be able to input a sufficient amount of funds into the transaction. On the output side, we would prefer to have at most two outputs, one being the receiving address and the other for returning the exceeding funds to the source address. Note that there could be several outputs to the receiving address as well. Such transactions emulate account based transactions, where funds are taken from a single account (address) and transferred to the single other account (address). These kinds of transactions are considered kind of special and we consider them _one-to-one_ transactions. Note that such a transaction may have additional non-value outputs (for example `OP_RETURN` output with a payment reference).

One-to-one payments must necessarily be full payments.

### Storing transactions

Consider a UTXO blockchain transaction with a given transaction id that is read from a RPC API. Its outputs (in `vout` array) contain destination addresses, but its inputs contain only references to the corresponding outputs of the input transactions (the transaction id and the output index). In order to obtain the address and the amount on an input, we need to actually read the input transaction through a RPC API call and obtain the data from the input transaction's output on the relevant index. We can do this for each transaction input which requires as many additional RPC API calls as there are inputs. Once we do this, we can store the corresponding input transaction outputs into additional array we call `vinVouts`. The length of the array matches the length of the array `vin`. With this additional array we have full information about addresses and amounts on the transaction inputs.

Often we are not willing or it is not necessary to read all inputs, usually to reduce the number of calls to RPC API. MCC client library provides a class `UtxoTransaction` which incorporates the array `vinVouts` as a piece of additional data to the data obtained from the RPC API response (method `getrawtransaction`). In some cases we need to obtain just the data from certain inputs. According to the situation of how many input transaction outputs are collected in the array `vinVouts` we have the following transaction types:
owing:

-  `full_payment` - all the input transaction outputs are fetched in `vinVouts`.
-  `partial_payment`- not all but at least one or more input transaction outputs are fetched in `vinVouts`.
-  `payment` - none of input transaction outputs are fetched in `vinVouts`.
-  `coinbase` - transaction is a special coinbase transaction - no input transactions exists.

Next: [Native payment](./native-payment.md)
