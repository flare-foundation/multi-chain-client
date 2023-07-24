import BN from "bn.js";
import { MccClient, MccUtxoClient } from "../../module";
import { TransactionSuccessStatus } from "../../types/genericMccTypes";
import { IUtxoGetTransactionRes, IUtxoTransactionAdditionalData, IUtxoVinTransaction, IUtxoVinVoutsMapper, IUtxoVoutTransaction } from "../../types/utxoTypes";
import { bytesToHex } from "../../utils/algoUtils";
import { bech32Decode } from "../../utils/bech32";
import { BTC_MDU } from "../../utils/constants";
import { mccError, mccErrorCode } from "../../utils/errors";
import { ZERO_BYTES_32, btcBase58Decode, isValidBytes32Hex, prefix0x, standardAddressHash, toBN, toHex, unPrefix0x } from "../../utils/utils";
import { WordToOpcode } from "../../utils/utxoUtils";
import { AddressAmount, BalanceDecreasingProps, BalanceDecreasingSummaryResponse, BalanceDecreasingSummaryStatus, TransactionBase } from "../TransactionBase";

export type UtxoTransactionTypeOptions = "coinbase" | "payment" | "partial_payment" | "full_payment";
// Transaction types and their description
// - coinbase        : transaction that mints new coins
// - payment         : what you get from node
// - partial_payment : transaction with some vout of vins added to additional data
// - full_payment    : transaction with vouts for all vins added to additional data
//@Managed()
export abstract class UtxoTransaction extends TransactionBase {
   protected get data(): IUtxoGetTransactionRes {
      return this.privateData as IUtxoGetTransactionRes;
   }

   protected get additionalData(): IUtxoTransactionAdditionalData | undefined {
      return this.privateAdditionalData as IUtxoTransactionAdditionalData | undefined;
   }

   protected set additionalData(data: IUtxoTransactionAdditionalData | undefined) {
      this.privateAdditionalData = data;
   }

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
      const references = [];
      for (const vo of this.data.vout) {
         if (vo.scriptPubKey.hex.substring(0, 2) == unPrefix0x(toHex(WordToOpcode.OP_RETURN))) {
            const dataSplit = vo.scriptPubKey.asm.split(" ");
            references.push(dataSplit[1]);
         }
      }
      return references;
   }

   public get stdPaymentReference(): string {
      let paymentReference = this.reference.length === 1 ? prefix0x(this.reference[0]) : "";
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
      if (!this.additionalData || !this.additionalData.vinouts) {
         return [undefined];
      }
      return this.additionalData.vinouts.map((mapper: IUtxoVinVoutsMapper | undefined) => mapper?.vinvout?.scriptPubKey.address);
   }

   public get receivingAddresses(): (string | undefined)[] {
      /* istanbul ignore if */
      // Transaction should always have vout array
      if (!this.data.vout) {
         return [];
      }
      return this.data.vout.map((vout: IUtxoVoutTransaction) => vout.scriptPubKey.address);
   }

   toBnValue(value: number | undefined): BN {
      if (value === undefined) {
         return toBN(0);
      }
      return toBN(Math.round(value * BTC_MDU).toFixed(0));
   }
   reducerFunctionAdditionalDataVinOuts = (prev: BN, vout: IUtxoVinVoutsMapper | undefined) => prev.add(this.toBnValue(vout?.vinvout?.value));
   reducerFunctionPrevouts = (prev: BN, vin: IUtxoVinTransaction) => prev.add(this.toBnValue(vin?.prevout?.value));
   reducerFunctionVouts = (prev: BN, vout: IUtxoVoutTransaction) => prev.add(this.toBnValue(vout.value));

   public get fee(): BN {
      if (this.type === "full_payment") {
         if (!this.additionalData || !this.additionalData.vinouts) {
            throw new mccError(mccErrorCode.InvalidTransaction, Error(`Transaction was not made full`));
         }
         const inSum = this.additionalData.vinouts.reduce(this.reducerFunctionAdditionalDataVinOuts, toBN(0));
         const outSum = this.data.vout.reduce(this.reducerFunctionVouts, toBN(0));
         return inSum.sub(outSum);
      }
      if (this.type === "coinbase") {
         // Coinbase transactions mint coins
         return toBN(0);
      }
      throw new mccError(mccErrorCode.InvalidResponse, Error("fee can't be calculated for `payment` and `partial_payment` transaction types"));
   }

   public get feeSignerTotalAmount(): AddressAmount {
      throw new Error("Method not implemented.");
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

      if (!this.additionalData || !this.additionalData.vinouts) {
         return [
            {
               amount: toBN(0),
            } as AddressAmount,
         ];
      }

      return this.additionalData.vinouts.map((mapper: IUtxoVinVoutsMapper | undefined) => {
         let amount: BN;
         if (mapper == undefined) {
            amount = toBN(0);
         } else {
            amount = toBN(Math.round((mapper?.vinvout?.value || 0) * BTC_MDU).toFixed(0));
         }

         return {
            address: mapper?.vinvout?.scriptPubKey?.address,
            amount: amount,
            utxo: mapper?.vinvout?.n,
         } as AddressAmount;
      });
   }

   public get intendedSpentAmounts(): AddressAmount[] {
      return this.spentAmounts;
   }

   public get receivedAmounts(): AddressAmount[] {
      return this.data.vout.map((vout: IUtxoVoutTransaction) => {
         return {
            address: vout.scriptPubKey.address,
            amount: this.isValidPkscript(vout.n) ? this.toBnValue(vout.value) : toBN(0), //If pkscript is not valid, value is set to 0.
            utxo: vout.n,
         } as AddressAmount;
      });
   }

   public get intendedReceivedAmounts(): AddressAmount[] {
      return this.receivedAmounts;
   }

   public get type(): UtxoTransactionTypeOptions {
      if (this.data.vin.length === 0 || this.data.vin[0].coinbase) {
         return "coinbase";
      }
      let hasUndefined = false;
      let hasDefined = false;
      if (!this.additionalData || !this.additionalData.vinouts) {
         return "payment";
      }
      for (let i = 0; i < this.additionalData.vinouts.length; i++) {
         const vinOut = this.additionalData.vinouts[i];
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

   public get elementaryUnits(): BN {
      return toBN(BTC_MDU);
   }

   public get successStatus(): TransactionSuccessStatus {
      return TransactionSuccessStatus.SUCCESS;
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   public async balanceDecreasingSummary({ sourceAddressIndicator, client }: BalanceDecreasingProps): Promise<BalanceDecreasingSummaryResponse> {
      // We expect sourceAddressIndicator to be utxo vin index (as hex string)
      if (!isValidBytes32Hex(sourceAddressIndicator)) {
         return { status: BalanceDecreasingSummaryStatus.NotValidSourceAddressFormat };
      }
      const vinIndex = parseInt(sourceAddressIndicator, 16);
      if (isNaN(vinIndex)) {
         return { status: BalanceDecreasingSummaryStatus.NotValidSourceAddressFormat };
      }
      try {
         this.assertValidVinIndex(vinIndex);
      } catch (e) {
         return { status: BalanceDecreasingSummaryStatus.InvalidInUtxo };
      }
      if (this.isValidAdditionalData()) {
         const spentAmounts = this.spentAmounts;
         const spentAmount = spentAmounts[vinIndex];
         if (spentAmount.address) {
            return {
               status: BalanceDecreasingSummaryStatus.Success,
               response: {
                  blockTimestamp: this.unixTimestamp,
                  transactionHash: this.stdTxid,
                  sourceAddressIndicator: sourceAddressIndicator,
                  sourceAddressHash: standardAddressHash(spentAmount.address),
                  sourceAddress: spentAmount.address,
                  spentAmount: spentAmount.amount,
                  transactionStatus: this.successStatus,
                  paymentReference: this.stdPaymentReference,
                  isFull: true,
               },
            };
         }
         // Else we have to extract vin
      }
      if (!client) {
         throw new Error("Client not provided");
      }
      // TODO how to make sure client you provided is BTC client
      const vinVout = await this.extractVinVoutAt(vinIndex, client as MccUtxoClient);

      if (vinVout?.vinvout?.scriptPubKey?.address) {
         return {
            status: BalanceDecreasingSummaryStatus.Success,
            response: {
               blockTimestamp: this.unixTimestamp,
               transactionHash: this.stdTxid,
               sourceAddressIndicator: sourceAddressIndicator,
               sourceAddressHash: standardAddressHash(vinVout.vinvout.scriptPubKey.address),
               sourceAddress: vinVout.vinvout.scriptPubKey.address,
               spentAmount: toBN(Math.round((vinVout.vinvout.value || 0) * BTC_MDU).toFixed(0)),
               transactionStatus: this.successStatus,
               paymentReference: this.stdPaymentReference,
               isFull: false,
            },
         };
      }
      // We didn't find the address we are looking for
      return { status: BalanceDecreasingSummaryStatus.NoSourceAddress };
   }

   public async makeFull(client: MccClient): Promise<void> {
      await this.makeFullPayment(client as MccUtxoClient);
   }

   ///////////////////////////////
   //// Utxo specific methods ////
   ///////////////////////////////

   /**
    * Asserts whether the vin index is in valid range. If not, exception is thrown.
    * @param vinIndex vin index
    */
   assertValidVinIndex(vinIndex: number) {
      if (vinIndex < 0 || vinIndex >= this.sourceAddresses.length) {
         throw new mccError(mccErrorCode.InvalidParameter, Error("Invalid vin index"));
      }
   }

   /**
    * Asserts whether the vout index is in valid range. If not, exception is thrown.
    * @param voutIndex vout index
    */
   assertValidVoutIndex(voutIndex: number) {
      if (voutIndex < 0 || voutIndex >= this.receivingAddresses.length) {
         throw new mccError(mccErrorCode.InvalidParameter, Error("Invalid vout index"));
      }
   }

   /**
    * Asserts whether vinvouts Mapper is full mapper and only has unique and matching indices
    */
   assertAdditionalData() {
      if (this.additionalData) {
         if (this.additionalData.vinouts?.length !== this.data.vin.length) {
            throw new mccError(mccErrorCode.InvalidParameter, Error("Bad format, Additional data vinvouts and data vin length mismatch"));
         }
         this.additionalData.vinouts.forEach((vinvout, ind) => {
            if (vinvout && vinvout.index !== ind) {
               throw new mccError(mccErrorCode.InvalidParameter, Error("Additional data corrupted: indices mismatch"));
            }
         });
      }
   }

   isValidAdditionalData(): boolean {
      if (this.additionalData) {
         if (this.additionalData.vinouts?.length !== this.data.vin.length) {
            return false;
         }
         this.additionalData.vinouts.forEach((vinvout, ind) => {
            if (vinvout && vinvout.index !== ind) {
               return false;
            }
         });
         return true;
      }
      return false;
   }

   synchronizeAdditionalData() {
      const tempAdditionalData = this.additionalData;

      this.additionalData = {
         vinouts: new Array(this.data.vin.length).fill(undefined),
      };
      if (tempAdditionalData?.vinouts) {
         for (const vinvout of tempAdditionalData.vinouts) {
            if (vinvout) {
               if (vinvout.index < 0 || vinvout.index >= this.data.vin.length || !this.additionalData || !this.additionalData.vinouts) {
                  throw new mccError(mccErrorCode.InvalidParameter, new Error("vinvout wrong index out of range"));
               }
               this.additionalData.vinouts[vinvout.index] = vinvout;
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
         throw new mccError(
            mccErrorCode.InvalidParameter,
            new Error(`Vin and vout transaction miss match; requested index ${voutIndex}, found index ${toReturn.n}`)
         );
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
         vinvout: connectedTrans.extractVoutAt(vinObject.vout || 0),
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
      if (!this.additionalData || !this.additionalData.vinouts) {
         throw new mccError(mccErrorCode.NotImplemented, new Error(`Can not happen`));
      }
      let vinVout = this.additionalData.vinouts[vinIndex];
      if (vinVout) {
         return vinVout;
      }
      if (!client) {
         throw new Error("Client not provided");
      }
      vinVout = await this.extractVinVoutAt(vinIndex, client);
      this.additionalData.vinouts[vinIndex] = vinVout;
      return vinVout;
   }

   /**
    * Checks if the input on index `vinIndex` is fetched.
    * @param vinIndex vin index
    * @returns true if input on the index `vinIndex` is already fetched.
    */
   public isSyncedVinIndex(vinIndex: number): boolean {
      this.assertValidVinIndex(vinIndex);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return !!this.additionalData!.vinouts![vinIndex];
   }

   /**
    * Fetches all the vin data from input transactions and makes the payment full_payment.
    * @param client mcc client to use for fetching input data
    */
   public async makeFullPayment(client: MccUtxoClient) {
      const promises = [];
      this.synchronizeAdditionalData();
      for (let i = 0; i < this.data.vin.length; i++) {
         promises.push(this.vinVoutAt(i, client as MccUtxoClient));
      }
      await Promise.all(promises);
   }

   /**
    * Doge has additional brackets around addresses in out tx
    * @param vout
    * @returns
    */
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

   // Scripts and output transaction script types
   /**
    * Validate that the pkscript and address for a given vout index match.
    * @param voutIndex
    */
   public abstract isValidPkscript(voutIndex: number): boolean;

   /**
    * Weather a output is a valid "nice" payment output currently P2PKH or P2PK
    * @param voutIndex index of the output we are checking
    * @returns weather a vout script is standard P2PKH or P2PK
    */
   public isValidPaymentScript(voutIndex: number): boolean {
      return this.isP2PKH(voutIndex) || this.isP2PK(voutIndex);
   }

   //// P2PKH

   /**
    * Checks if the output on index `voutIndex` is P2PKH. (Pay to public key hash)
    * @param voutIndex index of the output we are checking
    * @returns weather a vout script is standard P2PKH
    */
   public isP2PKH(voutIndex: number): boolean {
      const vout = this.extractVoutAt(voutIndex);
      const script_commands = vout.scriptPubKey.asm.split(" ");
      return (
         script_commands.length === 5 &&
         script_commands[0] === "OP_DUP" &&
         script_commands[1] === "OP_HASH160" &&
         script_commands[3] === "OP_EQUALVERIFY" &&
         script_commands[4] === "OP_CHECKSIG"
      );
   }

   /**
    * Checks that address specified by `address` is actually the one that can redeem the script for a valid P2PKH output script
    * @param voutIndex index of the output we are checking
    * @returns weather the output script is spendable by address
    */
   public isValidP2PKH(voutIndex: number): boolean {
      if (!this.isP2PKH(voutIndex)) {
         return false;
      }
      const vout = this.extractVoutAt(voutIndex);
      console.dir(vout);
      const address = vout.scriptPubKey.address;
      if (!address) {
         return false;
      }
      const addressHex = btcBase58Decode(address);
      // This is the version check for P2PKH
      if (addressHex[0] !== 0x00) {
         return false;
      }
      const xx = bytesToHex(addressHex.slice(1, 21));
      const script_commands = vout.scriptPubKey.asm.split(" ");
      const hash = script_commands[2];
      return hash === xx;
   }

   //// P2WPKH

   public isP2WPKH(voutIndex: number): boolean {
      const vout = this.extractVoutAt(voutIndex);
      console.dir(vout);
      const script_commands = vout.scriptPubKey.asm.split(" ");
      return script_commands.length === 2 && script_commands[0] === "0";
   }

   //this is to ok
   public isValidP2WPKH(voutIndex: number): boolean {
      if (!this.isP2WPKH(voutIndex)) {
         return false;
      }
      const vout = this.extractVoutAt(voutIndex);
      const address = vout.scriptPubKey.address;
      if (!address) {
         return false;
      }
      // let addressData: string;
      // testnet must start with tb1
      // if (address.startsWith("bc1")) {
      //    addressData = address.slice(3);
      // } else {
      //    return false;
      // }
      const addressHex = bech32Decode(address);
      console.dir(addressHex);
      // This is the version check for P2PKH
      const script_commands = vout.scriptPubKey.asm.split(" ");
      const hash = script_commands[1];
      return false;
   }

   //// P2PK

   /**
    * Checks if the output on index `voutIndex` is P2PK. (Pay to public key)
    * @param voutIndex index of the output we are checking
    * @returns weather a vout script is standard P2PK
    */
   public isP2PK(voutIndex: number): boolean {
      const vout = this.extractVoutAt(voutIndex);
      const script_commands = vout.scriptPubKey.asm.split(" ");
      return script_commands.length === 2 && script_commands[1] === "OP_CHECKSIG";
   }

   public isValidP2PK(voutIndex: number): boolean {
      if (!this.isP2PK(voutIndex)) {
         return false;
      }
      throw new Error("Not implemented");
   }
}
