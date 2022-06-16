import { mccSettings } from "../../global-settings/globalSettings";
import { IAlgoBlockMsgPack, IAlgoTransactionMsgPack } from "../../types";
import { bufAddToCBufAdd, bytesToHex, hexToBase32, hexToBase64, SignedTransactionWithAD } from "../../utils/algoUtils";
import { GetTryCatchWrapper, SyncTryCatchWrapper } from "../../utils/errors";
import { Trace } from "../../utils/trace";
import { mccJsonStringify } from "../../utils/utils";
import { BlockBase } from "../BlockBase";
import { AlgoTransaction } from "../TransactionBase";

// @Trace()
export class AlgoBlock extends BlockBase<IAlgoBlockMsgPack> {
   transactionObjects: AlgoTransaction[];
   constructor(data: IAlgoBlockMsgPack) {
      super(data);
      this.transactionObjects = [];
      this.processTransactions();
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
      return bytesToHex(this.data?.cert?.prop?.dig);
   }

   public get unixTimestamp(): number {
      return this.data?.block?.ts;
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
      if (!this.data.block.txns) {
         return 0;
      }
      return this.data?.block?.txns?.length;
   }

   ////////////////////////////////////////
   //// Additional transaction objects ////
   ////////////////////////////////////////

   processTransactions() {
      this.transactionObjects = [];
      for (let transactionBase of this.data.block.txns) {
         try {
            // we have to ensure all addresses are buffers with checksum
            if (transactionBase.txn.rcv) transactionBase.txn.rcv = bufAddToCBufAdd(transactionBase.txn.rcv);
            if (transactionBase.txn.snd) transactionBase.txn.snd = bufAddToCBufAdd(transactionBase.txn.snd);
            if (transactionBase.txn.arcv) transactionBase.txn.arcv = bufAddToCBufAdd(transactionBase.txn.arcv);
            const st = new SignedTransactionWithAD(this.data.block.gh, this.data.block.gen, transactionBase);
            const data = {
               txid: st.txn.txn.txID(),
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
            // TODO logger
            // TODO What happens if there is a transaction we dont know how to process
            mccSettings.loggingCallback(`Unable to process transaction ${mccJsonStringify(transactionBase)}`);
            // throw e;
         }
      }
   }
}
