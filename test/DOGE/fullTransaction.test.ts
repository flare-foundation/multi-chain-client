import { expect } from "chai";
import { IUtxoVinVoutsMapper, MCC, UtxoMccCreate } from "../../src";
import { getTestFile } from "../testUtils";

const DogeMccConnection = {
    url: process.env.DOGE_URL || "",
    username: process.env.DOGE_USERNAME || "",
    password: process.env.DOGE_PASSWORD || "",
    apiTokenKey: process.env.FLARE_API_PORTAL_KEY || "",
} as UtxoMccCreate;

interface AdditionalDataAsserts {
    index: number;
    value: number;
    address: string;
}

describe(`Transaction Doge test ,(${getTestFile(__filename)})`, function () {
    let MccClient: MCC.DOGE;

    before(async function () {
        MccClient = new MCC.DOGE(DogeMccConnection);
    });

    it("Should update transaction type when making full ", async function () {
        const txid = "a4d9dbd0047cc48526586fc6d64d4404ba594f5e152e268a48d0abbd786782bc";
        const transaction = await MccClient.getTransaction(txid);

        //console.log("HERE");

        expect(transaction.type).to.eq("partial_payment");

        const getter = (a: string) => MccClient.getTransaction(a);
        // const getter = MccClient.getTransaction;

        await transaction.makeFull(getter);

        expect(transaction.type).to.eq("full_payment");
    });

    it("Should check additional data ", async function () {
        const txid = "a4d9dbd0047cc48526586fc6d64d4404ba594f5e152e268a48d0abbd786782bc";
        const transaction = await MccClient.getTransaction(txid);

        expect(transaction.type).to.eq("partial_payment");

        await transaction.makeFull((a: string) => MccClient.getTransaction(a));

        expect(transaction.type).to.eq("full_payment");

        // console.dir(transaction._additionalData);

        const addData: IUtxoVinVoutsMapper[] = transaction._additionalData.vinouts;

        let indexCounter = 0;

        const expected_add: AdditionalDataAsserts[] = [
            {
                index: 0,
                value: 3967436.83298823,
                address: "D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P",
            },
            {
                index: 1,
                value: 353.657103,
                address: "D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P",
            },
            {
                index: 2,
                value: 1.00000001,
                address: "D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P",
            },
            {
                index: 3,
                value: 556.75685312,
                address: "D9gTzd79xNDLWfA1BvU3B231ykPvcYy96P",
            },
        ];

        for (const prevout of addData) {
            // console.log(prevout);
            expect(prevout.index).to.eq(indexCounter);
            const addresses = prevout.vinvout ? prevout.vinvout?.scriptPubKey.addresses : ["null"];
            const address = addresses ? (addresses.length >= 1 ? addresses[0] : "null") : "null";

            expect(address).to.eq(expected_add[indexCounter].address);
            expect(prevout.vinvout?.value).to.eq(expected_add[indexCounter].value);

            indexCounter += 1;
        }
    });
});
