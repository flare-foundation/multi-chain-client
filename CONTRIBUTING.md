# Contributing

If you want to contribute to this project, you MUST follow the guidelines below.

Any changes you make SHOULD be noted in the changelog.

For merge request to be accepted, it MUST pass all linter and formatter checks,
MUST pass all tests, and MUST be reviewed by at least one other contributor.

## Set up your dev environment

We are using nvm to manage node versions. Make sure you are using the same node version as the one specified in `.nvmrc` file.

```sh
nvm install
nvm use
```

As a package manager we use `yarn`. Make sure you have it installed and run the following command to install all dependencies:

```sh
corepack enable
yarn install --frozen-lockfile
```

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

## Linting and formatting

To run the linter and formatter, use the following command:

To check
```sh
yarn lint:check
yarn format:check
```

To fix isses that are fixable by linter and formatter automatically
```sh
yarn lint:fix
yarn format:fix
```

Make sure to check both linter, formatter and run tests before committing.

## Testing

In order to run the tests one needs a connection to a running DOGE node (mainnet), BTC node (mainnet), XRP node (mainnet) and XRP node (testnet). Provide the url and possible basic auth credentials as variables in env.
```sh
# BITCOIN

BTC_URL=url
BTC_USERNAME=user
BTC_PASSWORD=pass

BTC_URL_REGTEST=url
BTC_USERNAME_REGTEST=user
BTC_PASSWORD_REGTEST=pass


# DOGECOIN

DOGE_URL=url
DOGE_USERNAME=user
DOGE_PASSWORD=pass

DOGE_URL_REGTEST=url
DOGE_USERNAME_REGTEST=user
DOGE_PASSWORD_REGTEST=pass


# XRP

XRP_URL=url
XRP_USERNAME=user
XRP_PASSWORD=pass

XRP_URL_TESTNET=url
XRP_USERNAME_TESTNET=user
XRP_PASSWORD_TESTNET=pass
```

You can run a specific test using:
```sh
yarn test <path_to_test_file>
```
Run all tests associated with one of the supported chains using 
```sh
yarn test:btc
yarn test:doge
yarn test:xrp
```
Run all of the test
```sh
yarn test:all
```
Run all of the tests and create coverage report
```sh
yarn test:coverage
```