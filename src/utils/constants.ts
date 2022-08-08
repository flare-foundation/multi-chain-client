///////////////
// Constants //
///////////////

export const STD_TXID_REGEX = /^[a-fA-F0-9]{64}$/;
export const PREFIXED_STD_TXID_REGEX = /^(0x)[a-fA-F0-9]{64}$/;

export const STD_BLOCK_HASH_REGEX = /^[a-fA-F0-9]{64}$/;
export const PREFIXED_STD_BLOCK_HASH_REGEX = /^(0x)[a-fA-F0-9]{64}$/;

/////////////////////////////
// Minimal divisible units //
/////////////////////////////
// These constants are provided as conversion rates between minimal divisible units and their token

// Satoshi to BTC 100_000_000
export const BTC_MDU = 1e8;

// Ripple drops 1_000_000
export const XRP_MDU = 1e6;

// Microalgo
export const ALGO_MDU = 1e6;

////////////////////////////////
// TIME DELTA TRANSFORMATIONS //
////////////////////////////////
// Unix timestamp delta
export const XRP_UTD = 946684800;

////////////////////////
// Native token names //
////////////////////////
export const XRP_NATIVE_TOKEN_NAME = "XRP";
export const ALGO_NATIVE_TOKEN_NAME = "ALGO";
export const BTC_NATIVE_TOKEN_NAME = "BTC";
export const LTC_NATIVE_TOKEN_NAME = "LTC";
export const DOGE_NATIVE_TOKEN_NAME = "DOGE";
