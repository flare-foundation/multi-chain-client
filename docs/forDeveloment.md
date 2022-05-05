

## Naming convention

### For types

1. We use [CamelCase](https://en.wikipedia.org/wiki/Camel_case)
2. We start with uppercase letter
3. For abbreviation we only use only use uppercase for first letter `UseBTC` -> `UseBtc`

We name interfaces as following:

1. For method responses

```
I<ChainAssetName><MethodName>Res
For example:
IUtxoGetTransactionRes
```

2. For method inputs

```
I<ChainAssetName><MethodName>
For example:
IUtxoGetTransaction
```

3. For specific parts of method inputs (for example Vin For Utxo transaction creation)

```
II<ChainAssetName><MethodName>
For example:
IIUtxoVin
```

4. For general Data Types

```
I<ChainAssetName><DataType>
For example:
IUtxoScriptPubKey
```

## To use this with attestor client

1. Make sure this repo and attester-client repo are in the same root
2. If you make changes to MCC make sure to rebuild it `yarn build`
3. Rebuild the local dependency in attester client with `yarn install --force`
