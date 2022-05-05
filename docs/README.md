# Flare MCC Docs

## Multi chain client documentations

What is MCC

Mcc or multi chain client is a library used to query blockchain nodes in a unified manner and fetch the data from them as unified data responses as objects that hold all original information one can get form specific node and add static named properties to reposed objects.
Currently we unify [block](./blockObjects/BlockObject.md) and [transaction](./transactionObjects/TransactionObject.md) objects. 

Connecting node configurations

Mcc Client

-  [Basic use](./basicUse.md)
-  [Mcc connect config](./connectConfig.md)
-  Limiting processor
-  Blockchain essentials
   -  [Data sources](./definitions/sources.md)
   -  [Account based vs. UTXO model](./definitions/account-based-vs-utxo-chains.md)
   -  [Native payment](./definitions/native-payment.md)
   -  [Payment reference](./definitions/payment-reference.md)
   -  [Transaction status](./definitions/transaction-status.md)
-  [Block objects](./blockObjects/BlockObject.md)
   -  [BtcBlock](./blockObjects/BtcLtcDogeBlock.md)
   -  [LtcBlock](./blockObjects/BtcLtcDogeBlock.md)
   -  [DogeBlock](./blockObjects/BtcLtcDogeBlock.md)
   -  [XrpBlock](./blockObjects/XrpBlock.md)
   -  [AlgoBlock](./blockObjects/AlgoBlock.md)
-  [Transaction objects](./transactionObjects/TransactionObject.md)
   -  [BtcTransaction](./transactionObjects/BtcLtcDogeTransaction.md)
   -  [LtcTransaction](./transactionObjects/BtcLtcDogeTransaction.md)
   -  [DogeTransaction](./transactionObjects/BtcLtcDogeTransaction.md)
   -  [XrpTransaction](./transactionObjects/XrpTransaction.md)
   -  [AlgoTransaction](./transactionObjects/AlgoTransaction.md)
