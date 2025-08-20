import { expect } from "chai";
import { MCC, PaymentNonexistenceSummaryStatus, ZERO_BYTES_32, retry, standardAddressHash } from "../../src";
import { getTestFile } from "../testUtils";

const XRPMccConnection = {
    url: process.env.XRP_URL || "",
    username: process.env.XRP_USERNAME || "",
    password: process.env.XRP_PASSWORD || "",
};

describe(`summary tests, ${getTestFile(__filename)}`, function () {
    let MccClient: MCC.XRP;

    before(async function () {
        MccClient = new MCC.XRP(XRPMccConnection);
    });

    it("Should be able to extract balance decreasing", async function () {
        const tx_id = "27D592539E1FB00E8E4C4B6022729CB5559DE94AA2285AE510664A7E0891B3DB";
        const transaction = await retry("XRP.getTransaction", () => MccClient.getTransaction(tx_id));
        const dec = transaction.balanceDecreasingSummary(standardAddressHash("r4s3spDTkS5xZoQujwEzbjgep3NUPTiHyq"));
        expect(dec.status).to.eq("success");
        if (dec.response) {
            const decRes = dec.response;
            expect(decRes.blockTimestamp).to.eq(1681890461);
            expect(decRes.transactionHash).to.eq(tx_id);
            expect(decRes.sourceAddressHash).to.eq(standardAddressHash("r4s3spDTkS5xZoQujwEzbjgep3NUPTiHyq"));
            expect(decRes.sourceAddress).to.eq("r4s3spDTkS5xZoQujwEzbjgep3NUPTiHyq");
            expect(decRes.spentAmount.toString()).to.eq("3008927670");
            expect(decRes.paymentReference).to.eq(ZERO_BYTES_32);
            expect(decRes.sourceAddressIndicator).to.eq(standardAddressHash("r4s3spDTkS5xZoQujwEzbjgep3NUPTiHyq"));
            expect(decRes.isFull).to.eq(true);
        }
    });

    it("Should be able to compute nonexistence summary", async function () {
        const tx_id = "27D592539E1FB00E8E4C4B6022729CB5559DE94AA2285AE510664A7E0891B3DB";
        const transaction = await retry("XRP.getTransaction", () => MccClient.getTransaction(tx_id));
        const summary = transaction.paymentNonexistenceSummary();
        expect(summary.status).to.eq(PaymentNonexistenceSummaryStatus.Success);
        if (summary.response) {
            const decRes = summary.response;
            expect(decRes.blockTimestamp).to.eq(1681890461);
            expect(decRes.transactionHash).to.eq(tx_id);
            expect(decRes.paymentReference).to.eq(ZERO_BYTES_32);
            expect(decRes.receivedAmount).to.eq(3008927646n);
        }
    });

    it("Should be able to extract balance decreasing", async function () {
        const tx_id = "C034A5716E451E33BE1D5827B7B995976F2E846BD1810EDD6EFB6BA4C1B32AB3";
        const transaction = await retry("XRP.getTransaction", () => MccClient.getTransaction(tx_id));
        const dec = transaction.balanceDecreasingSummary(standardAddressHash("rKi8uT8GQsyKvNo4ie4MVGsqsLUjG3noEy"));
        expect(dec.status).to.eq("success");
        if (dec.response) {
            const decRes = dec.response;
            expect(decRes.blockTimestamp).to.eq(1749671961);
            expect(decRes.transactionHash).to.eq(tx_id);
            expect(decRes.sourceAddressHash).to.eq(standardAddressHash("rKi8uT8GQsyKvNo4ie4MVGsqsLUjG3noEy"));
            expect(decRes.sourceAddress).to.eq("rKi8uT8GQsyKvNo4ie4MVGsqsLUjG3noEy");
            expect(decRes.spentAmount.toString()).to.eq("12");
            expect(decRes.paymentReference).to.eq(ZERO_BYTES_32);
            expect(decRes.sourceAddressIndicator).to.eq(standardAddressHash("rKi8uT8GQsyKvNo4ie4MVGsqsLUjG3noEy"));
            expect(decRes.isFull).to.eq(true);
        }
    });
});
