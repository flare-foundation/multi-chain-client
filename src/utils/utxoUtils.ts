import { LiteBlock } from "../base-objects/blocks/LiteBlock";
import { MccError } from "./utils";

/**
 * Opcode words to their opcodes
 * @dev https://en.bitcoin.it/wiki/Script
 */
export enum WordToOpcode {
   OP_RETURN = 106,
}

export async function recursive_block_hash(clinet: any, hash: string, processHeight: number): Promise<string[]> {
   if (hash === "") {
      return [];
   }
   if (processHeight <= 1) {
      return [hash];
   } else {
      const Cblock = await clinet.getBlockHeader(hash);
      const hs = Cblock?.previousblockhash || "";
      return (await recursive_block_hash(clinet, hs, processHeight - 1)).concat([hash]);
   }
}

export async function recursive_block_tip(clinet: any, tip: LiteBlock, processHeight: number): Promise<LiteBlock[]> {
   if (tip.stdBlockHash === "") {
      return [];
   }
   const tempTip = new LiteBlock({ hash: tip.stdBlockHash, number: tip.number });
   if (processHeight <= 1) {
      return [tempTip];
   } else {
      const CurrBlock = await clinet.getBlockHeader(tip.stdBlockHash);
      const previousHash = CurrBlock?.previousblockhash || "";
      const previousHeight = CurrBlock?.height - 1 || 0;
      return (await recursive_block_tip(clinet, new LiteBlock({ hash: previousHash, number: previousHeight }), processHeight - 1)).concat([tempTip]);
   }
}

////////////////////////////
//// MCC Error handling ////
////////////////////////////

/**
 * Check if return error code is -5 (can't find transaction)
 * @param data
 * @returns
 */
export function utxo_check_expect_empty(data: any): boolean {
   if (!data || !data.error) {
      return false;
   }
   if (data.error.code && data.error.code === -5) {
      return true;
   } else {
      return false;
      // throw MccError(data);
   }
}

export function utxo_check_expect_block_out_of_range(data: any): boolean {   
   if (data.error !== null) {
      if (data.error.code === -8) {
         return true;
      }
      if (data.error.code === -1) {
         return true;
      } else {
         // throw MccError(data);
         return false;
      }
   } else {
      return false;
   }
}

export function utxo_ensure_data(data: any) {
   if (data.error !== null) {
      throw MccError(data);
   }
}
