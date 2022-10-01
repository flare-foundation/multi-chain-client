# Development notes

## Versions

1. Build the project `yarn build`
2. Check that lib can be created `npm pack`
3. Bump to next version `npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]`
4. Publish `npm publish`
5. Make sure to push to git `git push`

## Naming conventions for types

1. We use [CamelCase](https://en.wikipedia.org/wiki/Camel_case).
2. We start with uppercase letter.
3. For abbreviations we only use uppercase for the first letter `UseBTC` -> `UseBtc`.

We name interfaces as follows:

1. For method responses: `I<ChainAssetName><MethodName>Res`

   For example:

   ```javascript
   IUtxoGetTransactionRes;
   ```

2. For method inputs: `I<ChainAssetName><MethodName>`

   For example:

   ```javascript
   IUtxoGetTransaction;
   ```

3. For specific parts of method inputs (for example Vin For Utxo transaction creation): `II<ChainAssetName><MethodName>`

   For example:

   ```javascript
   IIUtxoVin;
   ```

4. For general Data Types: `I<ChainAssetName><DataType>`

   For example:

   ```javascript
   IUtxoScriptPubKey;
   ```

## To use this with the attestor client

1. Make sure this repo and the attestor-client repo are in the same root.
2. If you make changes to MCC make sure to rebuild it with `yarn build`
3. Rebuild the local dependency in attestor client with `yarn install --force`
