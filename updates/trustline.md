solaris state connector

- currency code (the 3 letter code) in the amount object

-  https://xrpl.org/currency-formats.html#currency-codes (for codes)

read about account lines
https://xrpl.org/account_lines.html


account info
https://xrpl.org/account_info.html#account_info

https://xrpl.org/setregularkey.html#setregularkey




https://xrpl.org/accountroot.html

check all account transaction 
https://xrpl.org/account_tx.html



example
https://testnet.xrpl.org/accounts/rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo


# Sporocilo

We managed to add functionalities for checking the account state (with all functionalities required for 
reaching state-connector consensus). We have noticed that while querying account_tx method the api responses from node are not consistent (by design). 
Even if you query with provided ledger_index_min and max the node can respond with different range of blocks, even while using full history node.
See the note in this docs page https://xrpl.org/account_tx.html#account_tx

Do you perhaps know how one can consistently get transaction history from exactly the required block range. We can do that from our indexed database 
but then we are limited to blocks that happened in the last day (and this can in future be changed by governance proposals)

Would it be ok that full Issuance Process procedure was required to be finished and attested to in the last day? That way we can simply process all transactions done by a particular account in our indexer database where we can consistently control the block range.
