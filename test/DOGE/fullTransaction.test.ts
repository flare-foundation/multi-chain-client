import { expect } from "chai";
import { MCC, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

describe(`Transaction Doge test ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.DOGE;

    before(async function () {
        MccClient = new MCC.DOGE(DogeMccConnection);
    });

    it("Should update transaction type when making full ", async function () {
        const txid = "a4d9dbd0047cc48526586fc6d64d4404ba594f5e152e268a48d0abbd786782bc";
        const transaction = await MccClient.getTransaction(txid);

        //console.log("HERE");

        expect(transaction.type).to.eq("payment");

        const getter = (a: string) => MccClient.getTransaction(a);
        // const getter = MccClient.getTransaction;

        await transaction.makeFull(getter);

        expect(transaction.type).to.eq("full_payment");
    });

    it("Should check additional data ", async function () {
        const txid = "a4d9dbd0047cc48526586fc6d64d4404ba594f5e152e268a48d0abbd786782bc";
        const transaction = await MccClient.getTransaction(txid);

        expect(transaction.type).to.eq("payment");

        await transaction.makeFull((a: string) => MccClient.getTransaction(a));

        expect(transaction.type).to.eq("full_payment");

        //console.dir(transaction._additionalData);
    });
});
