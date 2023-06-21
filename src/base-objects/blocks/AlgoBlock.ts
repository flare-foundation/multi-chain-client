import { mccSettings } from "../../global-settings/globalSettings";
import { IAlgoBlockMsgPack, IAlgoTransactionMsgPack } from "../../types";
import { bytesToHex, calculateAlgoTxid, hexToBase32, hexToBase64 } from "../../utils/algoUtils";
import { mccJsonStringify } from "../../utils/utils";
import { BlockBase } from "../BlockBase";
import { AlgoTransaction } from "../transactions/AlgoTransaction";

export class AlgoBlock extends BlockBase {
   transactionObjects: AlgoTransaction[];
   constructor(data: IAlgoBlockMsgPack) {
      super(data);
      this.transactionObjects = [];
      this.processTransactions();
   }

   protected get data(): IAlgoBlockMsgPack {
      return this.privateData as IAlgoBlockMsgPack;
   }

   public get number(): number {
      return this.data.block.rnd;
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

   public get previousBlockHash(): string {
      return hexToBase64(this.data.block.prev);
   }

   public get stdPreviousBlockHash(): string {
      return bytesToHex(this.data.block.prev);
   }

   public get unixTimestamp(): number {
      return this.data.block.ts;
   }

   public get transactionIds(): string[] {
      return this.transactionObjects.map((trasn) => {
         return trasn.txid;
      });
   }

   public get stdTransactionIds(): string[] {
      return this.transactionObjects.map((trasn) => {
         return trasn.stdTxid;
      });
   }

   public get transactions(): AlgoTransaction[] {
      return this.transactionObjects;
   }

   public get transactionCount(): number {
      if (this.data.block.txns) {
         return this.data.block.txns.length;
      }
      return 0;
   }

   ////////////////////////////////////////
   //// Additional transaction objects ////
   ////////////////////////////////////////

   processTransactions() {
      this.transactionObjects = [];
      if (!this.data.block.txns) {
         return;
      }
      for (const transactionBase of this.data.block.txns) {
         try {
            const data = {
               txid: calculateAlgoTxid(this.data.block.gh, this.data.block.gen, transactionBase),
               timestamp: this.unixTimestamp,
               hgi: transactionBase.hgi,
               ...transactionBase.txn,
            } as IAlgoTransactionMsgPack;
            if (transactionBase.sig) data.sig = transactionBase.sig;
            if (transactionBase.lsig) data.lsig = transactionBase.lsig;
            if (transactionBase.msig) data.msig = transactionBase.msig;
            if (transactionBase.sgnr) data.sgnr = transactionBase.sgnr;
            this.transactionObjects.push(new AlgoTransaction(data));
         } catch (e) {
            /* istanbul ignore next */
            // TODO logger
            // TODO What happens if there is a transaction we dont know how to process
            mccSettings.loggingCallback(`Unable to process transaction ${mccJsonStringify(transactionBase)}`);
            // throw e;
         }
      }
   }
}
