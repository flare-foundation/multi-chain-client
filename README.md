# Multi-Chain Client

Welcome to MCC.

## What is the MCC?

MCC or Multi-Chain Client is a Typescript library that allows querying nodes from any blockchain in a unified manner. Retrieved data is encapsulated in objects that hold all the original information and allow adding static, named properties.

## Underlying nodes

We recommend to deploy nodes from our docker [repo](https://github.com/flare-foundation/connected-chains-docker)


## Documentation (outdated)

[Find it here](./docs/README.md).

## Development notes

[Find notes for developers here](./docs/forDeveloment.md).


## Testing
In order to run the tests one needs a connection to a running DOGe node (mainnet), BTC node (mainnet), XRP node (mainnet) and XRP node (testnet). Provide the url and possible basic auth credentials as variables in env.
```sh
# BITCOIN
BTC_URL=url
BTC_USERNAME=user
BTC_PASSWORD=pass
# DOGECOIN
DOGE_URL=url
DOGE_USERNAME=user
DOGE_PASSWORD=pass
# XRP
XRP_URL=url
XRP_USERNAME=user
XRP_PASSWORD=pass
# XRP TESTNET
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