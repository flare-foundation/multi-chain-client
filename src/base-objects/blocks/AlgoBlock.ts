import { IAlgoBlockMsgPack } from "../../types";
import { base64ToHex, bufAddToCBufAdd, bytesToHex, filterHashes, hexToBase32, hexToBase64, txIdToHexNo0x } from "../../utils/algoUtils";
import { BlockBase } from "../BlockBase";
import { AlgoTransaction } from "../TransactionBase";

export class AlgoBlock extends BlockBase<IAlgoBlockMsgPack> {
   transactionObjects: AlgoTransaction []
   constructor(data: IAlgoBlockMsgPack, additionalData?: any) {
      super(data);
      this.transactionObjects = []



   }

   public get number(): number {
      return this.data?.block?.rnd;
   }

   public get blockHash(): string {
      return hexToBase64(this.data.cert.prop.dig);
   }

   // Algo special
   public get blockHashBase32(): string {
      return hexToBase32(this.data.cert.prop.dig);
   }

   // Algo special
   public get blockHashBase64(): string {
      return hexToBase64(this.data.cert.prop.dig);
   }

   public get stdBlockHash(): string {
      return bytesToHex(this.data.cert.prop.dig);
   }

   public get unixTimestamp(): number {
      return this.data?.block?.ts;
   }

   public get transactionIds(): string[] {
      if (this.data?.block?.txns === undefined) {
         return [];
      }
      return this.data?.block?.txns.map(filterHashes);
   }

   public get stdTransactionIds(): string[] {
      return this.transactionIds.map(txIdToHexNo0x);
   }

   public get transactionCount(): number {
      if (!this.data.block.txns) {
         return 0;
      }
      return this.data?.block?.txns.length;
   }

   ////////////////////////////////////////
   //// Additional transaction objects ////
   ////////////////////////////////////////

   processTransactions() {
      for(let transactionBase of this.data.block.txns) {
         // we have to ensure all addresses are buffers with checksum
         if(transactionBase.txn.rcv) transactionBase.txn.rcv = bufAddToCBufAdd(transactionBase.txn.rcv);
         if(transactionBase.txn.snd) transactionBase.txn.snd = bufAddToCBufAdd(transactionBase.txn.snd);
         // const st = new SignedTransactionWithAD(
         //    block.data.block.gh,
         //    block.data.block.gen,
         //    edited
         //   )
      }
   }
}
