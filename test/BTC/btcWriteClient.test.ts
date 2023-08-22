import { MCC } from "../../src/index";
import { expect } from "chai";

const reg_tests_url = process.env.BTC_URL_REGTEST || "";
const reg_test_user = process.env.BTC_USERNAME_REGTEST || "";
const reg_test_pass = process.env.BTC_PASSWORD_REGTEST || "";

import { getAddressByLabelResponse, IIUtxoVout, UtxoRpcInterface } from "../../src/types";

export function round_for_ltc(input: number) {
    return parseFloat(input.toFixed(8));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendMinimalUTXOTransaction(RPC: any, fromWalletLabel: string, from: string, to: string) {
    const unspent = await RPC.listUnspentTransactions(fromWalletLabel);
    const vin = [];
    const vinaddresses = [];
    let unspentAmount = 0;
    for (const utx of unspent) {
        if (utx.address == from) {
            vin.push({
                txid: utx.txid,
                vout: utx.vout,
            });
            vinaddresses.push(utx.address);
            unspentAmount += utx.amount;
        }
    }
    const gas = 1e-5;
    const test_amount = 1e-5;
    if (unspentAmount < gas + test_amount) {
        console.error("Not enough founds on sender wallet");
        throw Error("Insufficient founds on sender wallet");
    }
    const vout: IIUtxoVout[] = [
        { address: to, amount: test_amount },
        { address: from, amount: round_for_ltc(unspentAmount - test_amount - gas) },
    ];
    const a = await RPC.createRawTransaction(fromWalletLabel, vin, vout);
    const signkeys = [];
    for (const add of vinaddresses) {
        signkeys.push(await RPC.getPrivateKey(fromWalletLabel, add));
    }
    const signedTx = await RPC.signRawTransaction(fromWalletLabel, a, signkeys);
    const txId = await RPC.sendRawTransactionInBlock(fromWalletLabel, signedTx.hex);
    return txId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendUtxoTransaction(RPC: any, fromWalletLabel: string, from: string, to: string, amount: number, gas: number = 1e-5) {
    const unspent = await RPC.listUnspentTransactions(fromWalletLabel);
    const vin = [];
    const vinaddresses = [];
    let unspentAmount = 0;
    for (const utx of unspent) {
        if (utx.address == from) {
            vin.push({
                txid: utx.txid,
                vout: utx.vout,
            });
            vinaddresses.push(utx.address);
            unspentAmount += utx.amount;
        }
    }
    const test_amount = amount - gas;
    if (unspentAmount < gas + test_amount) {
        console.error("Not enough founds on sender wallet");
        throw Error("Insufficient founds on sender wallet");
    }
    const vout: IIUtxoVout[] = [
        { address: to, amount: test_amount },
        { address: from, amount: round_for_ltc(unspentAmount - test_amount - gas) },
    ];
    const a = await RPC.createRawTransaction(fromWalletLabel, vin, vout);
    const signkeys = [];
    for (const add of vinaddresses) {
        signkeys.push(await RPC.getPrivateKey(fromWalletLabel, add));
    }
    const signedTx = await RPC.signRawTransaction(fromWalletLabel, a, signkeys);
    // const txId = await RPC.sendRawTransactionInBlock(fromWalletLabel, signedTx.hex);
    const txId = await RPC.sendRawTransaction(fromWalletLabel, signedTx.hex);
    return txId;
}

describe("BTC client tests", () => {
    describe("General functionalities", function () {
        it.skip("should get block height from regtest network", async function () {
            const BtcRpc = new MCC.BTC({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass });
            const a = await BtcRpc.getBlockHeight();
            expect(a).to.greaterThan(100);
        });
    });

    it.skip("Test transactions", async function () {
        const nBtcRpc = new MCC.BTC({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass, inRegTest: true });

        const test_wall = "test_wall_2";

        try {
            await nBtcRpc.createWallet(test_wall);
            // load wallet
        } catch {
            console.log("Catch");
        }

        const new_add = await nBtcRpc.createAddress(test_wall, "test_add", "bech32");

        const new_add_2 = await nBtcRpc.createAddress(test_wall, "test_add2", "bech32");

        console.log("From");
        console.log(new_add);

        console.log("To:");
        console.log(new_add_2);

        const found = await nBtcRpc.fundAddress(new_add, 10);

        console.log("fund the address");
        console.log(found);

        const bb = await sendMinimalUTXOTransaction(nBtcRpc, test_wall, new_add, new_add_2);

        console.log("transakcija");
        console.log(bb);
        // let tx = await nBtcRpc.getTransaction(found,{verbose:true})

        // console.log(tx);
    });

    it.skip("should be able to get addresses list ", async function () {
        const nBtcRpc = new MCC.BTC({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass });
        const addresses = await nBtcRpc.listAllAddressesByLabel("test_wall", "test_add");
        // console.log(addresses);
        expect(addresses.length).to.greaterThan(0);
    });

    it.skip("should get no such transaction response ", async function () {
        const nBtcRpc = new MCC.BTC({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass });
        const transaction = await nBtcRpc.getTransaction("ab2267bafb5a4d93486b451cf9de79dec478763e21ddd22705a24ae3aa856ec7");
        console.log(transaction);
        // expect(addresses.length).to.greaterThan(0);
    });

    it.skip("should check get transaction response typings ", async function () {
        const nBtcRpc = new MCC.BTC({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass, inRegTest: true });
        const tx = "ab2267bafb5a4d93486b451cf9de79dec478763e21ddd22705a24ae3aa856ec3";
        const txres = await nBtcRpc.getTransaction(tx);
        expect(typeof txres).to.equal("string");
    });

    describe("All possible transaction types", function () {
        // let possibleRPC: UtxoRpcInterface;
        const addresses_leg: getAddressByLabelResponse[] = [];
        const addresses_leg_2: getAddressByLabelResponse[] = [];
        const addresses_seg: getAddressByLabelResponse[] = [];
        const addresses_seg_2: getAddressByLabelResponse[] = [];
        const addresses_bec: getAddressByLabelResponse[] = [];
        const addresses_bec_2: getAddressByLabelResponse[] = [];

        const test_wall = "all_possible_wallet";
        // const test_acc_leg = "all_possible_add_leg";
        // const test_acc_seg = "all_possible_add_seg";
        // const test_acc_bec = "all_possible_add_bec";

        // const test_acc_2_leg = "all_possible_add_leg_rec";
        // const test_acc_2_seg = "all_possible_add_seg_rec";
        // const test_acc_2_bec = "all_possible_add_bec_rec";

        // before(async function () {
        //    possibleRPC = new MCC.BTC({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass, inRegTest: true });
        //    try {
        //       await possibleRPC.createWallet(test_wall);
        //    } catch {
        //       try {
        //          await possibleRPC.loadWallet(test_wall);
        //       } catch {}
        //    }

        //    try {
        //       addresses_leg = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_leg);
        //    } catch {}
        //    if (addresses_leg.length === 0) {
        //       // we need to create legacy address
        //       await possibleRPC.createAddress(test_wall, test_acc_leg, "legacy");
        //    }
        //    try {
        //       addresses_leg_2 = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_2_leg);
        //    } catch {}
        //    if (addresses_leg_2.length === 0) {
        //       // we need to create legacy address
        //       await possibleRPC.createAddress(test_wall, test_acc_2_leg, "legacy");
        //    }

        //    try {
        //       addresses_seg = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_seg);
        //    } catch {}
        //    if (addresses_seg.length === 0) {
        //       // we need to create legacy address
        //       await possibleRPC.createAddress(test_wall, test_acc_seg, "p2sh-segwit");
        //    }
        //    try {
        //       addresses_seg_2 = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_2_seg);
        //    } catch {}
        //    if (addresses_seg_2.length === 0) {
        //       // we need to create legacy address
        //       await possibleRPC.createAddress(test_wall, test_acc_2_seg, "p2sh-segwit");
        //    }

        //    try {
        //       addresses_bec = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_bec);
        //    } catch {}
        //    if (addresses_bec.length === 0) {
        //       // we need to create legacy address
        //       await possibleRPC.createAddress(test_wall, test_acc_bec, "bech32");
        //    }
        //    try {
        //       addresses_bec_2 = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_2_bec);
        //    } catch {}
        //    if (addresses_bec_2.length === 0) {
        //       // we need to create legacy address
        //       await possibleRPC.createAddress(test_wall, test_acc_2_bec, "bech32");
        //    }

        //    addresses_leg = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_leg);
        //    addresses_leg_2 = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_2_leg);
        //    addresses_seg = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_seg);
        //    addresses_seg_2 = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_2_seg);
        //    addresses_bec = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_bec);
        //    addresses_bec_2 = await possibleRPC.listAllAddressesByLabel(test_wall, test_acc_2_bec);
        // });

        // it.skip("should create tx legacy -> legacy", async function () {
        //    await possibleRPC.fundAddress(addresses_leg[0].address, 10);
        //    const ttx = await sendUtxoTransaction(possibleRPC, test_wall, addresses_leg[0].address, addresses_leg_2[0].address, 10 - 1e-4, 1e-4);

        //    console.log("Legacy -> Legacy: ", ttx);
        // });

        // it.skip("should create tx p2sh-segwit -> p2sh-segwit", async function () {
        //    await possibleRPC.fundAddress(addresses_seg[0].address, 10);
        //    const ttx = await sendUtxoTransaction(possibleRPC, test_wall, addresses_seg[0].address, addresses_seg_2[0].address, 10 - 1e-4, 1e-4);

        //    console.log("p2sh-segwit -> p2sh-segwit: ", ttx);
        // });

        // it.skip("should create tx bech32 -> bech32", async function () {
        //    await possibleRPC.fundAddress(addresses_bec[0].address, 10);
        //    const ttx = await sendUtxoTransaction(possibleRPC, test_wall, addresses_bec[0].address, addresses_bec_2[0].address, 10 - 1e-4, 1e-4);

        //    console.log("bech32 -> bech32: ", ttx);
        // });

        it.skip("should log all addresses: ", async function () {
            console.log(addresses_leg);
            console.log(addresses_leg_2);

            console.log(addresses_seg);
            console.log(addresses_seg_2);

            console.log(addresses_bec);
            console.log(addresses_bec_2);
        });
    });
});
