# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## \[[Unreleased]\]

### Added

- Reformating according to new handbook and dev structure

# \[[v4.3.0](https://www.npmjs.com/package/@flarenetwork/mcc/v/4.3.0)\] - 2025-04-01  

### Fixed
* toOne filed for UTXO transactions
* Typo fixes


# \[[v4.0.1](https://www.npmjs.com/package/@flarenetwork/mcc/v/4.0.1)\] - 2023-12-06  

### Changed
* Adaptation of full indexing on transaction and block objects on BTC and DOGE
  * Every UTXO transaction now has all inputs and outputs with their values
  * All summary methods now assume that feature
* Removed BN dependency and added BigInt dependency where necessary
* Using median time on BTC and DOGE chains

## OLD changelog

# 3.2.0
- Removed un-maintained instances for ALGO and LTC
- Added the support for BTC version 25 (full tx verbosity)
- Doge and btc transaction logic separation (due to node change)

# 3.1.0

* Dogecoin transaction parsing fix 
* Removed circular dependency issues

# 3.0.3

* bugfix transaction confirmation check in utxo core (doge does not provide this in response)

# 3.0.2

* added `_data` and `_additional` data to all base project to enable reading of private data
* updated payment summary tests for BTC chain

# 3.0.1

* updated base objects to not be generic to response type

# 3.0.0

* Updated XRP Transaction and block getters 
* Using XRP Transactions meta prop to analyze affected nodes
* Added FullBlock<T> object that extends Block object and has a getter returning MCC Transaction objects for the underlying chain.
