# How to manage xrp transactions

We use a hybrid of xrpl.js xrpl docs and a pre-build verification script found here: `src/scripts/xrplJsTransactionTypesCheck.ts`

1. We have hardcoded string based union type called `XrpTransactionTypeUnion`
2. We have dependency on xrpl.js that has tagged parameter called `TransactionType`
3. We have a script that checks if they match found here `src/scripts/xrplJsTransactionTypesCheck.ts`

For each specific type, it is crucial to read the official documentation and to find examples of the transaction type and represent them in tests.

## AccountSet

Set options on an account.

### Mainnet example

-  327FD263132A4D08170E1B01FE1BB2E21D0126CE58165C97A9173CA9551BCD70

### Field grouping / native tokens

sourceAddresses

```
Account
```

receivingAddresses

```
/
```

spentAmounts

```
Fee
```

receivedAmounts

```
/
```

### Field grouping / native assets

assetSourceAddresses

```
/
```

assetReceivingAddresses

```
/
```

assetSpentAmounts

```
/
```

assetReceivedAmounts

```
/
```

## AccountDelete

Delete an account.

### Mainnet example

-  1AF19BF9717DA0B05A3BFC5007873E7743BA54C0311CCCCC60776AAEAC5C4635

### Field grouping / native tokens

sourceAddresses

```
Account
```

receivingAddresses

```
Destination
```

spentAmounts

```
Fee + DeliveredAmount
```

receivedAmounts

```
DeliveredAmount
```

# AMMBid

Bid on an Automated Market Maker's auction slot, which grants a discounted fee.

# AMMCreate

Create a new Automated Market Maker for trading a given pair of assets.

# AMMDeposit

Deposit funds into an Automated Market Maker in exchange for LPTokens.

# AMMVote

Vote on the trading fee for an Automated Market Maker instance.

# AMMWithdraw

Return LPTokens into an Automated Market Maker in exchange for a share of the assets the pool holds.

## Check Transactions

https://xrpl.org/known-amendments.html#checks

## CheckCancel

Cancel a check.

## CheckCash

Redeem a check.

## CheckCreate

Create a check.

# DepositPreauth

Preauthorizes an account to send payments to this one.

# EscrowCancel

Reclaim escrowed XRP.

# EscrowCreate

Create an escrowed XRP payment.

# EscrowFinish

Deliver escrowed XRP to recipient.

# NFTokenAcceptOffer

Accept an offer to buy or sell an NFToken.

# NFTokenBurn

Use TokenBurn to permanently destroy NFTs.

# NFTokenCancelOffer

Cancel existing token offers to buy or sell an NFToken.

# NFTokenCreateOffer

Create an offer to buy or sell NFTs.

# NFTokenMint

Use TokenMint to issue new NFTs.

# OfferCancel

Withdraw a currency-exchange order.

# OfferCreate

Submit an order to exchange currency.

## Payment

Send funds from one account to another.
Mcc further differentiates between native token payments and build-in assets payments. On XRP ledger the transaction of type payment is used for both cases. The lib differentiates between the two depending on the `Amount` field.

-  Native Payment --- Amount is of type `string`
-  Token Payment --- Amount is of type `Object`

### Field grouping / native tokens

sourceAddresses (both Native and Token)

```
Account
```

receivingAddresses (If Native)

```
Destination
```

receivingAddresses (If Token)

```
/
```

spentAmounts (If Native)

```
Fee + Amount
```

spentAmounts (If Token)

```
Fee
```

receivedAmounts (If Native)

```
Amount
```

receivedAmounts (If Token)

```
/
```

### Field grouping / native assets

assetSourceAddresses

```
/
```

assetReceivingAddresses

```
/
```

assetSpentAmounts

```
/
```

assetReceivedAmounts

```
/
```

# PaymentChannelClaim

Claim money from a payment channel.

# PaymentChannelCreate

Open a new payment channel.

# PaymentChannelFund

Add more XRP to a payment channel.

# SetRegularKey

Add, remove, or modify an account's regular key pair.

# SignerListSet

Add, remove, or modify an account's multi-signing list.

# TicketCreate

Set aside one or more sequence numbers as Tickets.

# TrustSet

Add or modify a trust line.
