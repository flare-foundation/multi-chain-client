[Home](../README.md)

# Ripple Mcc Object


## Methods


## Specific methods
### getAccountInfo

Method for retrieving information about accounts. 
For RPC endpoint docs see [this](https://xrpl.org/account_info.html#account_info)

to process flags use `processFlags` method from [utils](./../../src/utils/xrpUtils.ts)

```javascript 
const info = await MccClient.getAccountInfo('rBwD7GqAPFoZvzz6YaR5HyJWD8TUoaUbJo')
const flags = processFlags(info.result.account_data.Flags);
console.log(flags); // [ 'lsfPasswordSpent', 'lsfDisableMaster', 'lsfDefaultRipple' ]
```

Params:
| Parameter Name | External Type    | Internal type                    | Description                                                                                                                                   |
|----------------|------------------|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| account        | string           | string                           | A unique identifier for the account, most commonly the account's Address.                                                                     |
| upperBound     | number \| string | number \| blockHash \| 'Current' | either blockHash or block number for the upper bound (The information does not contain any changes from ledger versions newer than this one.) |


[Returns](https://xrpl.org/account_info.html#response-format):



### getAccountTransactions