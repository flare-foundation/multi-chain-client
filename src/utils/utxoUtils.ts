import { UtxoBlockTip } from "../base-objects/blockTips/UtxoBlockTip";
import { UtxoCore } from "../chain-clients/UtxoCore";
import { MccError } from "./utils";

/**
 * Opcode words to their opcodes
 * @dev https://en.bitcoin.it/wiki/Script
 */
export enum WordToOpcode {
   OP_RETURN = 106,
}

export async function recursive_block_hash(clinet: UtxoCore, hash: string, processHeight: number): Promise<string[]> {
   if (hash === "") {
      return [];
   }
   if (processHeight <= 1) {
      return [hash];
   } else {
      const Cblock = await clinet.getBlockHeader(hash);
      const hs = Cblock.previousBlockHash;
      return (await recursive_block_hash(clinet, hs, processHeight - 1)).concat([hash]);
   }
}

export async function recursive_block_tip(clinet: UtxoCore, tip: UtxoBlockTip, processHeight: number): Promise<UtxoBlockTip[]> {
   if (tip.stdBlockHash === "") {
      return [];
   }
   const tempTip = new UtxoBlockTip({ hash: tip.stdBlockHash, height: tip.number, branchlen: tip.data.branchlen, status: tip.data.status });
   if (processHeight <= 1) {
      return [tempTip];
   } else {
      const CurrBlock = await clinet.getBlockHeader(tip.stdBlockHash);
      const previousHash = CurrBlock.previousBlockHash;
      const previousHeight = CurrBlock.number - 1;
      return (
         await recursive_block_tip(
            clinet,
            new UtxoBlockTip({ hash: previousHash, height: previousHeight, branchlen: tip.data.branchlen, status: tip.chainTipStatus }),
            processHeight - 1
         )
      ).concat([tempTip]);
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
