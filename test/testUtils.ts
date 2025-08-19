import { assert, expect } from "chai";
import { AddressAmount, PaymentSummaryResponse } from "../src";
import { TransactionSuccessStatus } from "../src/types";

export const expectThrow = async (method: any, errorMessage: any) => {
    let error = null;
    try {
        await method;
    } catch (err: any) {
        error = err;
    }
    if (typeof errorMessage === "object") {
        // eslint-disable-next-line guard-for-in
        for (const prop in errorMessage) {
            expect(error).to.haveOwnProperty(prop);
            expect(error[prop]).to.eq(errorMessage[prop]);
        }
    } else {
        expect(error).to.equal(errorMessage);
    }
};

export function round_for_ltc(input: number) {
    return parseFloat(input.toFixed(8));
}

// export async function sendMinimalUTXOTransaction(RPC: any, fromWalletLabel: string, from: string, to: string) {
//     const unspent = await RPC.listUnspentTransactions(fromWalletLabel);
//     const vin = [];
//     const vinAddresses = [];
//     let unspentAmount = 0;
//     for (const utx of unspent) {
//         console.log("ALL utxo", utx);

//         if (utx.address === from) {
//             console.log(utx);

//             vin.push({
//                 txid: utx.txid,
//                 vout: utx.vout,
//             });
//             vinAddresses.push(utx.address);
//             unspentAmount += utx.amount;
//         }
//     }
//     const gas = 1e-5;
//     const test_amount = 1e-5;
//     if (unspentAmount < gas + test_amount) {
//         console.error("Not enough founds on sender wallet");
//         throw Error("Insufficient founds on sender wallet");
//     }
//     const vout: IIUtxoVout[] = [
//         { address: to, amount: test_amount },
//         { address: from, amount: round_for_ltc(unspentAmount - test_amount - gas) },
//     ];
//     const a = await RPC.createRawTransaction(fromWalletLabel, vin, vout);
//     const signKeys = [];
//     for (const add of vinAddresses) {
//         signKeys.push(await RPC.getPrivateKey(fromWalletLabel, add));
//     }
//     const signedTx = await RPC.signRawTransaction(fromWalletLabel, a, signKeys);
//     const txId = await RPC.sendRawTransactionInBlock(fromWalletLabel, signedTx.hex);
//     return txId;
// }

export function singleAddressAmountEqual(a: AddressAmount, b: AddressAmount) {
    return (
        a.address === b.address &&
        a.amount.toString() === b.amount.toString() &&
        a.elementaryUnits === b.elementaryUnits &&
        a.utxo === b.utxo
    );
}

export function AddressAmountEqual(a: AddressAmount[], b: AddressAmount[]) {
    if (a.length !== b.length) {
        return false;
    }

    const sortParam = (x: AddressAmount, y: AddressAmount) => {
        if (!x.address || !y.address) return 1;
        if (x.address === y.address) return 0;
        if (x.address > y.address) return 1;
        else return -1;
    };

    a.sort(sortParam);
    b.sort(sortParam);

    for (let i = 0; i < a.length; i++) {
        if (singleAddressAmountEqual(a[i], b[i]) === false) {
            return false;
        }
    }
    return true;
}

function getterBaseTester<R, T extends object>(c1: T, c2: T, getter: string): { result1: R; result2: R } | undefined {
    let result1, result2: R;
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result1 = c1[getter];
    } catch (error1) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            c2[getter];
        } catch (error2) {
            // Test that both functions threw the same error
            expect((error1 as any).message).to.equal((error2 as any).message);
            return;
        }
        // If function2 didn't throw an error, fail the test
        expect.fail("Function 1 threw an error but function 2 did not");
    }
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result2 = c2[getter];
    } catch (error2) {
        // If function1 returned a value, fail the test
        expect.fail("Function 1 returned a value but function 2 threw an error");
    }
    return {
        result1,
        result2,
    };
}

export function throwOrReturnSameGetter<T extends object>(c1: T, c2: T, getter: string) {
    const r = getterBaseTester(c1, c2, getter);
    if (r === undefined) {
        return;
    }
    // Test that both functions returned the same value
    expect(r.result1).to.deep.equal(r.result2);
}

export function throwOrReturnSameGetterList<T extends object>(c1: T, c2: T, getter: string) {
    const r = getterBaseTester<any[], T>(c1, c2, getter);
    if (r === undefined) {
        return;
    }
    // Test that both functions returned the same value
    expect(r.result1.sort()).to.deep.equal(r.result2.sort());
}

export function throwOrReturnSameGetterBN<T extends object>(c1: T, c2: T, getter: string) {
    const r = getterBaseTester<bigint, T>(c1, c2, getter);
    if (r === undefined) {
        return;
    }
    // Test that both functions returned the same value
    expect(r.result1.toString()).to.deep.equal(r.result2.toString());
}

export function throwOrReturnSameGetterAmounts<T extends object>(c1: T, c2: T, getter: string) {
    const r = getterBaseTester<AddressAmount[], T>(c1, c2, getter);
    if (r === undefined) {
        return;
    }
    // Test that both functions returned the same value
    assert(AddressAmountEqual(r.result1, r.result2));
}

export interface algoTransactionTestCases extends transactionTestCases {
    block: number;
}

export interface transactionTestCases {
    description: string;
    txid: string;
    expect: expectTransactionTestCase;
    makeFull?: boolean;
    summary: PaymentSummaryResponse;
}

export interface expectTransactionTestCase {
    txid: string;
    stdTxid: string;
    hash: string;
    reference: string[];
    stdPaymentReference: string;
    unixTimestamp: number;
    sourceAddresses: (string | undefined)[];
    sourceAddressesRoot: string;
    receivingAddresses: (string | undefined)[];
    isFeeError: boolean;
    fee: string; // number as a string or error string if error is expected
    spentAmounts: AddressAmount[];
    receivedAmounts: AddressAmount[];
    type: string;
    isNativePayment: boolean;
    currencyName: string;
    elementaryUnits: string; // number as string
    successStatus: TransactionSuccessStatus;
    isOneToOne?: boolean;
}

/**
 * Returns truncated file path.
 * @param file module filename
 * @returns file path from `test/` on, separated by `'/'`
 */
export function getTestFile(myFile: string) {
    return myFile.slice(myFile.replace(/\\/g, "/").indexOf("test/"));
}

export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Getters in transaction class
export const GETTERS_AMOUNTS = ["spentAmounts", "intendedSpentAmounts", "receivedAmounts", "intendedReceivedAmounts"]; //getters with return type AddressAmount[]
export const GETTERS_LISTS = ["reference", "sourceAddresses", "receivingAddresses"]; // getters with return type string[]
export const GETTERS_BASIC = [
    "txid",
    "stdTxid",
    "hash",
    "stdPaymentReference",
    "unixTimestamp",
    "successStatus",
    "type",
    "isNativePayment",
    "currencyName",
    "elementaryUnits",
    "feeSignerTotalAmount",
]; // getters with return type string
export const GETTERS_BN = ["fee"];
