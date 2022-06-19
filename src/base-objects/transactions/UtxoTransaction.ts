import BN from "bn.js";
import { isValidBytes32Hex, IUtxoGetTransactionRes, MccError, prefix0x, toBN, toHex, unPrefix0x, ZERO_BYTES_32 } from "../..";
import { MccClient, MccUtxoClient, TransactionSuccessStatus } from "../../types";
import { IUtxoTransactionAdditionalData, IUtxoVinTransaction, IUtxoVinVoutsMapper, IUtxoVoutTransaction } from "../../types/utxoTypes";
import { BTC_MDU } from "../../utils/constants";
import { WordToOpcode } from "../../utils/utxoUtils";
import { AddressAmount, PaymentSummary, TransactionBase } from "../TransactionBase";
import { Managed } from "../../utils/managed";

export type UtxoTransactionTypeOptions = "coinbase" | "payment" | "partial_payment" | "full_payment";
// Transaction types and their description
// - coinbase        : transaction that mints new coins
// - payment         : what you get from node
// - partial_payment : transaction with some vout of vins added to additional data
// - full_payment    : transaction with vouts for all vins added to additional data

@Managed()
export class UtxoTransaction extends TransactionBase<IUtxoGetTransactionRes, IUtxoTransactionAdditionalData> {
   constructor(data: IUtxoGetTransactionRes, additionalData?: IUtxoTransactionAdditionalData) {
      super(data, additionalData);
      this.data.vout.forEach((vout) => {
         this.processOutput(vout);
      });
      this.synchronizeAdditionalData();
      this.assertAdditionalData();
   }

   public get txid(): string {
      return this.data.txid;
   }

   public get stdTxid(): string {
      return unPrefix0x(this.txid);
   }

   public get hash(): string {
      return this.data.hash;
   }

   public get reference(): string[] {
      let references = [];
      for (let vo of this.data.vout) {
         if (vo.scriptPubKey.hex.substring(0, 2) == unPrefix0x(toHex(WordToOpcode.OP_RETURN))) {
            let dataSplit = vo.scriptPubKey.asm.split(" ");
            references.push(dataSplit[1]);
         }
      }
      return references;
   }

   public get stdPaymentReference(): string {
      let paymentReference = this.reference.length === 1 ? prefix0x(this.reference[0] || "") : "";
      if (!isValidBytes32Hex(paymentReference)) {
         paymentReference = ZERO_BYTES_32;
      }
      return paymentReference;
   }

   public get unixTimestamp(): number {
      return this.data.blocktime;
   }

   public get sourceAddresses(): (string | undefined)[] {
      if (this.type === "coinbase") {
         // Coinbase transactions mint coins
         return [undefined];
      }
      return this.additionalData!.vinouts!.map((mapper: IUtxoVinVoutsMapper | undefined) => mapper?.vinvout?.scriptPubKey.address);
   }

   public get receivingAddresses(): (string | undefined)[] {
      if (!this.data?.vout) {
         return [];
      }
      return this.data.vout.map((vout: IUtxoVoutTransaction) => vout.scriptPubKey.address);
   }

   public get fee(): BN {
      const reducerFunctionVinOuts = (prev: BN, vout: IUtxoVinVoutsMapper | undefined) =>
         prev.add(toBN(Math.round((vout?.vinvout?.value || 0) * BTC_MDU).toFixed(0)));
      const reducerFunctionVouts = (prev: BN, vout: IUtxoVoutTransaction) => prev.add(toBN(Math.round(vout.value * BTC_MDU).toFixed(0)));
      if (this.type === "full_payment") {
         if (this.additionalData && this.additionalData.vinouts) {
            let inSum = this.additionalData.vinouts.reduce(reducerFunctionVinOuts, toBN(0));
            let outSum = this.data.vout.reduce(reducerFunctionVouts, toBN(0));
            return inSum.sub(outSum);
         }
      }
      if (this.type === "coinbase") {
         // Coinbase transactions mint coins
         return toBN(0);
      }
      throw MccError("fee can't be calculated for `payment` and `partial_payment` transaction types");
   }

   public get spentAmounts(): AddressAmount[] {
      if (this.type === "coinbase") {
         // Coinbase transactions mint coins
         return [
            {
               amount: toBN(0),
            } as AddressAmount,
         ];
      }

      return this.additionalData!.vinouts!.map((mapper: IUtxoVinVoutsMapper | undefined) => {
         return {
            address: mapper?.vinvout?.scriptPubKey?.address,
            amount: toBN(Math.round((mapper?.vinvout?.value || 0) * BTC_MDU).toFixed(0)),
            utxo: mapper?.vinvout?.n,
         } as AddressAmount;
      });
   }

   public get receivedAmounts(): AddressAmount[] {
      return this.data.vout.map((vout: IUtxoVoutTransaction) => {
         return {
            address: vout.scriptPubKey.address,
            amount: toBN(Math.round((vout.value || 0) * BTC_MDU).toFixed(0)),
            utxo: vout.n,
         } as AddressAmount;
      });
   }

   public get type(): UtxoTransactionTypeOptions {
      if (this.data.vin.length === 0 || this.data.vin[0].coinbase) {
         return "coinbase";
      }
      let hasUndefined = false;
      let hasDefined = false;
      for (let i = 0; i < this.additionalData!.vinouts!.length; i++) {
         let vinOut = this.additionalData!.vinouts![i];
         if (vinOut === undefined) {
            hasUndefined = true;
         } else {
            hasDefined = true;
         }
      }

      if (hasDefined && !hasUndefined) {
         return "full_payment";
      }
      if (hasDefined) {
         return "partial_payment";
      }
      return "payment";
   }

   public get isNativePayment(): boolean {
      // On these chains there are no other types of transactions
      return true;
   }

   public get currencyName(): string {
      // This must be shadowed
      throw new Error("Method must be implemented in different sub class");
   }

   public get elementaryUnits(): BN {
      return toBN(BTC_MDU);
   }

   public get successStatus(): TransactionSuccessStatus {
      return TransactionSuccessStatus.SUCCESS;
   }

   public async paymentSummary(client?: MccClient, vinIndex?: number, voutIndex?: number, makeFullPayment?: boolean): Promise<PaymentSummary> {
      this.assertValidVinIndex(vinIndex, true);
      this.assertValidVoutIndex(voutIndex, true);

      // Refresh the inputs if needed
      if (makeFullPayment) {
         await this.makeFullPayment(client as MccUtxoClient);
      } else {
         // If vinIndex is not defined or null, then we do not need the input
         if (vinIndex != null) {
            await this.vinVoutAt(vinIndex, client as MccUtxoClient);
         }
      }

      let sourceAddress = vinIndex != null ? this.sourceAddresses[vinIndex!] : undefined;
      let receivingAddress = voutIndex != null ? this.receivingAddresses[voutIndex] : undefined;
      let oneToOne: boolean = !!sourceAddress && !!receivingAddress;
      let isFull = this.type === "full_payment";

      if (isFull) {
         let inFunds = toBN(0);
         let returnFunds = toBN(0);
         let outFunds = toBN(0);
         let inFundsOfReceivingAddress = toBN(0);

         for (let vinAmount of this.spentAmounts) {
            if (sourceAddress && vinAmount.address === sourceAddress) {
               inFunds = inFunds.add(vinAmount.amount);
            }
            if (receivingAddress && vinAmount.address === receivingAddress) {
               inFundsOfReceivingAddress = inFundsOfReceivingAddress.add(vinAmount.amount);
            }
            if (oneToOne && vinAmount.address != sourceAddress && vinAmount.address != receivingAddress) {
               oneToOne = false;
            }
         }
         for (let voutAmount of this.receivedAmounts) {
            if (sourceAddress && voutAmount.address === sourceAddress) {
               returnFunds = returnFunds.add(voutAmount.amount);
            }
            if (receivingAddress && voutAmount.address === receivingAddress) {
               outFunds = outFunds.add(voutAmount.amount);
            }
            // Outputs without address do not break one-to-one condition
            if (oneToOne && !voutAmount.address && voutAmount.amount.gt(toBN(0))) {
               oneToOne = false;
            }
            if (oneToOne && voutAmount.address && voutAmount.address != sourceAddress && voutAmount.address != receivingAddress) {
               oneToOne = false;
            }
         }
         return {
            isNativePayment: true,
            sourceAddress,
            receivingAddress,
            spentAmount: inFunds.sub(returnFunds),
            receivedAmount: outFunds.sub(inFundsOfReceivingAddress),
            paymentReference: this.stdPaymentReference,
            oneToOne,
            isFull,
         };
      }
      let spentAmount = sourceAddress ? this.spentAmounts[vinIndex!].amount : toBN(0);
      let receivedAmount = receivingAddress ? this.receivedAmounts[voutIndex!].amount : toBN(0);
      oneToOne = false;
      return {
         isNativePayment: true,
         sourceAddress,
         receivingAddress,
         spentAmount,
         receivedAmount,
         paymentReference: this.stdPaymentReference,
         oneToOne,
         isFull,
      };
   }

   ///////////////////////////////
   //// Utxo specific methods ////
   ///////////////////////////////

   /**
    * Asserts whether the vin index is in valid range. If not, exception is thrown.
    * @param vinIndex vin index
    */
   assertValidVinIndex(vinIndex?: number, canBeNull = false) {
      if (canBeNull && vinIndex == null) {
         return;
      }
      if (vinIndex == null || vinIndex < 0 || vinIndex >= this.sourceAddresses.length) {
         throw new Error("Invalid vin index");
      }
   }

   /**
    * Asserts whether the vout index is in valid range. If not, exception is thrown.
    * @param voutIndex vout index
    */
   assertValidVoutIndex(voutIndex?: number, canBeNull = false) {
      if (canBeNull && voutIndex == null) {
         return;
      }
      if (voutIndex == null || voutIndex < 0 || voutIndex >= this.receivingAddresses.length) {
         throw new Error("Invalid vout index");
      }
   }

   /**
    * Asserts whether vinvouts Mapper is full mapper and only has unique and matching indices
    */
   assertAdditionalData() {
      if (this.additionalData) {
         if (this.additionalData.vinouts?.length !== this.data.vin.length) {
            throw new Error("Bad format, Additional data vinvouts and data vin length mismatch");
         }
         this.additionalData?.vinouts.forEach((vinvout, ind) => {
            if (vinvout && vinvout.index !== ind) {
               throw new Error("Additional data corrupted: indices mismatch");
            }
         });
      }
   }

   synchronizeAdditionalData() {
      let tempAdditionalData = this.additionalData;

      this.additionalData = {
         vinouts: new Array(this.data.vin.length).fill(undefined),
      };
      if (tempAdditionalData?.vinouts) {
         for (let vinvout of tempAdditionalData.vinouts) {
            if (vinvout) {
               if (vinvout.index < 0 || vinvout.index >= this.data.vin.length) {
                  throw new Error("vinvout wrong index out of range");
               }
               this.additionalData!.vinouts![vinvout.index] = vinvout;
               this.processOutput(vinvout.vinvout);
            }
         }
      }
   }

   /**
    * Extract vout on vout index. If vout index is not valid or data is corrupted, exception is thrown.
    * @param voutIndex vout index
    * @returns vout on vout index
    */
   extractVoutAt(voutIndex: number): IUtxoVoutTransaction {
      this.assertValidVoutIndex(voutIndex);
      const toReturn = this.data.vout[voutIndex];
      if (toReturn.n !== voutIndex) {
         throw MccError(`Vin and vout transaction miss match; requested index ${voutIndex}, found index ${toReturn.n}`);
      }
      return toReturn;
   }

   /**
    *
    * @param vinIndex vin index
    * @returns vin on vin index
    */
   extractVinAt(vinIndex: number): IUtxoVinTransaction {
      this.assertValidVinIndex(vinIndex);
      return this.data.vin[vinIndex];
   }

   /**
    * Gets the vout corresponding to vin in the given vin index. If the vout is not fetched, the
    * input transaction is read and the corresponding vout is obtained
    * @param vinIndex vin index
    * @param client mcc client for fetching input the transactions
    * @returns input vout of the relevant utxo of the input transaction on the vin on the index `vinIndex`
    */
   private async extractVinVoutAt(vinIndex: number, client: MccUtxoClient): Promise<IUtxoVinVoutsMapper> {
      const vinObject = this.extractVinAt(vinIndex);
      if (!vinObject.txid) {
         return {
            index: vinIndex,
            vinvout: undefined,
         };
      }
      const connectedTrans = await client.getTransaction(vinObject.txid);
      if (connectedTrans === null) {
         return {
            index: vinIndex,
            vinvout: undefined,
         };
      }
      return {
         index: vinIndex,
         vinvout: connectedTrans.extractVoutAt(vinObject.vout!),
      };
   }

   /**
    * Gets the vout corresponding to vin in the given vin index. If it is not stored in the additionalData,
    * it's fetched and updated using the client.
    * @param vinIndex vin index
    * @param client mcc client to fetch transaction data
    * @returns input vout of the relevant utxo of the input transaction on the vin on the index `vinIndex`
    */
   public async vinVoutAt(vinIndex: number, client?: MccUtxoClient) {
      // note: vinouts list is always initialized
      if (!this.additionalData) {
         this.additionalData = {
            vinouts: new Array(this.data.vin.length).fill(undefined),
         };
      }
      let vinVout = this.additionalData!.vinouts![vinIndex];
      if (vinVout) {
         return vinVout;
      }
      if (!client) {
         throw new Error("MCC Client required.");
      }
      vinVout = await this.extractVinVoutAt(vinIndex, client);
      this.additionalData!.vinouts![vinIndex] = vinVout;
      return vinVout;
   }

   /**
    * Checks if the input on index `vinIndex` is fetched.
    * @param vinIndex vin index
    * @returns true if input on the index `vinIndex` is already fetched.
    */
   public isSyncedVinIndex(vinIndex: number): boolean {
      this.assertValidVinIndex(vinIndex);
      return !!this.additionalData!.vinouts![vinIndex];
   }

   /**
    * Fetches all the vin data from input transactions and makes the payment full_payment.
    * @param client mcc client to use for fetching input data
    */
   public async makeFullPayment(client: MccUtxoClient) {
      let promises = [];
      this.synchronizeAdditionalData();
      for (let i = 0; i < this.data.vin.length; i++) {
         promises.push(this.vinVoutAt(i, client as MccUtxoClient));
      }
      await Promise.all(promises);
      // console.log(this.additionalData);
      for (let i = 0; i < (this.additionalData?.vinouts?.length || 0); i++) {
         // console.log(this.additionalData?.vinouts![i]);
      }
   }

   private processOutput(vout: IUtxoVoutTransaction | undefined) {
      if (!vout) {
         return;
      }
      if (vout.scriptPubKey.address) {
         return;
      }
      if (vout.scriptPubKey.addresses && vout.scriptPubKey.addresses.length === 1) {
         vout.scriptPubKey.address = vout.scriptPubKey.addresses[0];
      }
      // otherwise `address` stays undefined
   }
}
