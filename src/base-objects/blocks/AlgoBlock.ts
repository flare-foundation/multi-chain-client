import { IAlgoBlockMsgPack } from "../../types";
import { base64ToHex, bytesToHex, filterHashes, hexToBase32, hexToBase64, txIdToHexNo0x } from "../../utils/algoUtils";
import { BlockBase } from "../BlockBase";

export class AlgoBlock extends BlockBase<IAlgoBlockMsgPack> {
   additionalData: any
   constructor(data: IAlgoBlockMsgPack, additionalData?: any) {
      super(data);
      this.additionalData = additionalData
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
}
