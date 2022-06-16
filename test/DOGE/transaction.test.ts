import { expect } from "chai";
import { BtcTransaction, MCC, MccClient, mccJsonStringify, UtxoMccCreate, UtxoTransaction } from "../../src";
import { IUtxoTransactionAdditionalData, IUtxoVinVoutsMapper } from "../../src/types/utxoTypes";

const DogeMccConnection = {
   url: process.env.DOGE_URL || "",
   username: process.env.DOGE_USERNAME || "",
   password: process.env.DOGE_PASSWORD || "",
} as UtxoMccCreate;

async function getVinVoutsAtIndex(index: number, trans: UtxoTransaction, client: MCC.BTC) {
   // const trans = await client.getTransaction(txid);
   if (trans) {
      const vin = trans.data.vin[index];
      if (vin.txid) {
         const parentTrans = await client.getTransaction(vin.txid);
         if (parentTrans) {
            return {
               index: index,
               vinvout: parentTrans.extractVoutAt(vin.vout!),
            };
         }
      }
   }
}

async function getVinVouts(trans: UtxoTransaction, client: MCC.BTC) {
   // const trans = await client.getTransaction(txid);
   if (trans) {
      const vinouts: IUtxoVinVoutsMapper[] = [];
      for (let index = 0; index < trans.data.vin.length; index++) {
         const vinvout = await getVinVoutsAtIndex(index, trans, client);
         if (vinvout) {
            vinouts.push(vinvout);
         }
      }
      return vinouts;
   }
}

async function getVinVoutsPartial(partialArray: number[], trans: UtxoTransaction, client: MCC.BTC) {
   // const trans = await client.getTransaction(txid);
   if (trans) {
      const vinouts: IUtxoVinVoutsMapper[] = [];
      for (let index of partialArray) {
         const vinvout = await getVinVoutsAtIndex(index, trans, client);
         if (vinvout) {
            vinouts.push(vinvout);
         }
      }
      return vinouts;
   }
}

describe("Transaction DOGE base test ", function () {
   let MccClient: MCC.DOGE;

   before(async function () {
      MccClient = new MCC.DOGE(DogeMccConnection);
   });

   describe("Transaction does not exist ", function () {
      const txid = "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d37786156ff";

      it("Should get network version ", async function () {
         let res = await MccClient.getNodeStatus();
         console.log(res);
      });

      it("Should get transaction does not exist ", async function () {
         let transaction = await MccClient.getTransaction(txid);
         expect(transaction).to.be.eq(null);
      });
   });

   //  describe("Transaction full ", function () {
   //     // const txid = "8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684";
   //     // const txid = "16920c5619b4c43fd5c9c0fc594153f2bf1a80c930238a8ee870aece0bc7cc59";
   //     const txid = "141479db9d6da30fafaf47e71ae6323cac57c391ea2f7f84754e0a70fea8e36a";
   //     let transaction: BtcTransaction;

   //     before(async () => {
   //        let fullTrans = await MccClient.getTransaction(txid);

   //        if (fullTrans) {
   //           const full = await getVinVouts(fullTrans, MccClient);
   //           console.log(full);
   //           const addData: IUtxoTransactionAdditionalData = {
   //              vinouts: full,
   //           };
   //           transaction = new BtcTransaction(fullTrans.data, addData);
   //        }
   //     });

   //     // console.log(fullTrans);
   //     // console.log("vout", fullTrans.data.vout);
   //     // console.log("vin", fullTrans.data.vin);
   //     // console.log(fullTrans.hash);
   //     // console.log(fullTrans.reference);
   //     // console.log(fullTrans.unixTimestamp);
   //     // console.log(fullTrans.sourceAddress);
   //     // console.log(fullTrans.receivingAddress);
   //     // console.log(fullTrans.fee.toString());
   //     // console.log(fullTrans.receivedAmount);
   //     // console.log(fullTrans.spentAmount);
   //     // console.log(fullTrans.type);
   //     // console.log(fullTrans.elementaryUnits.toString());
   //     // console.log(fullTrans.successStatus);
   //     // console.log(fullTrans.currencyName);
   //     // console.log(fullTrans.isNativePayment);

   //     it("Should get transaction hash ", async function () {
   //        console.log(transaction.hash);
   //     });

   //     it("Should get transaction reference array ", async function () {
   //        console.log(transaction.reference);
   //     });

   //     it("Should get transaction timestamp ", async function () {
   //        console.log(transaction.unixTimestamp);
   //     });

   //     it("Should get source address ", async function () {
   //        console.log(transaction.sourceAddress);
   //     });

   //     it("Should get receiving address ", async function () {
   //        console.log(transaction.receivingAddress);
   //     });

   //     it("Should get fee ", async function () {
   //        console.log(transaction.fee.toString());
   //     });

   //     it("Should received amount ", async function () {
   //        console.log(transaction.receivedAmount);
   //     });

   //     it("Should spend amount ", async function () {
   //        console.log(transaction.spentAmount);
   //     });

   //     it("Should get type ", async function () {
   //        console.log(transaction.type);
   //     });

   //     it("Should get elementary unit ", async function () {
   //        console.log(transaction.elementaryUnits.toString());
   //     });

   //     it("Should get success status ", async function () {
   //        console.log(transaction.successStatus);
   //     });

   //     it("Should get currency name ", async function () {
   //        console.log(transaction.currencyName);
   //     });

   //     it("Should check if native payment ", async function () {
   //        console.log(transaction.isNativePayment);
   //     });
   //  });

   // describe("Transaction partial ", function () {
   //    const txid = "16920c5619b4c43fd5c9c0fc594153f2bf1a80c930238a8ee870aece0bc7cc59";

   //    it("Should get transaction vins ", async function () {
   //       let basetransaction = await MccClient.getTransaction(txid);
   //       if (basetransaction) {
   //          const full = await getVinVoutsPartial([0],basetransaction, MccClient);
   //          console.log(full);
   //          const addData: IUtxoTransactionAdditionalData = {
   //             vinouts: full,
   //          };
   //          const transaction = new BtcTransaction(basetransaction.data, addData);
   //          // console.log(fullTrans);
   //          // console.log("vout", partialTrans.data.vout);
   //          // console.log("vin", partialTrans.data.vin);
   //          // console.log(partialTrans.hash);
   //          // console.log(partialTrans.reference);
   //          // console.log(partialTrans.unixTimestamp);
   //          // console.log(partialTrans.sourceAddress);
   //          // console.log(partialTrans.receivingAddress);
   //          // console.log(partialTrans.fee.toString());
   //          // console.log(partialTrans.receivedAmount);
   //          // console.log(partialTrans.spentAmount);
   //          // console.log(partialTrans.type);
   //          // console.log(partialTrans.elementaryUnits.toString());
   //          // console.log(partialTrans.successStatus);
   //          // console.log(partialTrans.currencyName);
   //          // console.log(partialTrans.isNativePayment);
   //          if(transaction){
   //             it("Should get transaction hash ", async function () {
   //                console.log(transaction.hash);
   //             });

   //             it("Should get transaction reference array ", async function () {
   //                console.log(transaction.reference);
   //             });

   //             it("Should get transaction timestamp ", async function () {
   //                console.log(transaction.unixTimestamp);
   //             });

   //             it("Should get source address ", async function () {
   //                console.log(transaction.sourceAddress);
   //             });

   //             it("Should get receiving address ", async function () {
   //                console.log(transaction.receivingAddress);
   //             });

   //             it("Should get fee ", async function () {
   //                console.log(transaction.fee.toString());
   //             });

   //             it("Should received amount ", async function () {
   //                console.log(transaction.receivedAmount);
   //             });

   //             it("Should spend amount ", async function () {
   //                console.log(transaction.spentAmount);
   //             });

   //             it("Should get type ", async function () {
   //                console.log(transaction.type);
   //             });

   //             it("Should get elementary unit ", async function () {
   //                console.log(transaction.elementaryUnits.toString());
   //             });

   //             it("Should get success status ", async function () {
   //                console.log(transaction.successStatus);
   //             });

   //             it("Should get currency name ", async function () {
   //                console.log(transaction.currencyName);
   //             });

   //             it("Should check if native payment ", async function () {
   //                console.log(transaction.isNativePayment);
   //             });
   //          }
   //       }
   //    });
   // });

   const TransactionsToTest = [
      {
         description: "Transaction 1 ",
         txid: "de07c395ab9e3d987f13f72ee71f0b3ba4217c3b4df6f9dd928fe579c014b90e",
      },
      // {
      //    description: "Transaction with multiple vins",
      //    txid: "16920c5619b4c43fd5c9c0fc594153f2bf1a80c930238a8ee870aece0bc7cc59",
      // },
      // {
      //    description: "Transaction with two reference",
      //    txid: "fbf351cd9f1a561be21e3977282e931c5209ed6b90472e225b4a674dbc643511",
      // },
      {
         description: "Coinbase Transaction",
         txid: "9d863418ef3761eb45fd38eea5074965efa1266694a8b2826d5ce148aa564095",
      },
   ];

   for (let transData of TransactionsToTest) {
      describe(transData.description, function () {
         let transaction: UtxoTransaction;
         before(async function () {
            let transactionb = await MccClient.getTransaction(transData.txid);
            if (transactionb !== null) {
               transaction = transactionb;
            }
         });

         it("Should get transaction hash ", async function () {
            console.log(transaction.hash);
         });

         it("Should get transaction reference array ", async function () {
            console.log(transaction.reference);
         });

         it("Should get transaction timestamp ", async function () {
            console.log(transaction.unixTimestamp);
         });

         it("Should get source address ", async function () {
            console.log(transaction.sourceAddresses);
         });

         it("Should get receiving address ", async function () {
            console.log(transaction.receivingAddresses);
         });

         it("Should get fee ", async function () {
            console.log(transaction.fee.toString());
         });

         it("Should received amount ", async function () {
            console.log(transaction.receivedAmounts);
         });

         it("Should spend amount ", async function () {
            console.log(transaction.spentAmounts);
         });

         it("Should get type ", async function () {
            console.log(transaction.type);
         });

         it("Should get elementary unit ", async function () {
            console.log(transaction.elementaryUnits.toString());
         });

         it("Should get success status ", async function () {
            console.log(transaction.successStatus);
         });

         it("Should get currency name ", async function () {
            console.log(transaction.currencyName);
         });

         it("Should check if native payment ", async function () {
            console.log(transaction.isNativePayment);
         });

         it.only("Should get transaction data ", async function () {
            console.log(mccJsonStringify(transaction.data));
         });
      });
   }
});
