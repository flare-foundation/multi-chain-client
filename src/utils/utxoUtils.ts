import { MccError } from "./utils";

/**
 * Opcode words to their opcodes
 * @dev https://en.bitcoin.it/wiki/Script
 */
export enum WordToOpcode {
   OP_RETURN = 106,
}

////////////////////////////
//// MCC Error handling ////
////////////////////////////

/**
 * Check if return error code is -5 (can't find transaction)
 * @param data
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function utxo_check_expect_empty(data: any): boolean {
   if (!data || !data.error || !data.error.code) {
      return false;
   }
   if (data.error.code && data.error.code === -5) {
      return true;
   } else {
      return false;
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function utxo_check_expect_block_out_of_range(data: any): boolean {
   if (data && data.error && data.error.code) {
      if (data.error.code === -8) {
         return true;
      }
      if (data.error.code === -1) {
         return true;
      } else {
         return false;
      }
   } else {
      return false;
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function utxo_ensure_data(data: any) {
   if (data?.error) {
      throw MccError(data);
   }
}
