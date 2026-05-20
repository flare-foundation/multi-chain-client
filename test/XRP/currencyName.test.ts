import { expect } from "chai";
import { XrpTransaction } from "../../src/base-objects";
import { IXrpGetTransactionRes } from "../../src/types/xrpTypes";
import { getTestFile } from "../testUtils";

/**
 * Unit tests for {@link XrpTransaction.currencyName}.
 *
 * Per XRPL docs (https://xrpl.org/docs/references/protocol/data-types/currency-formats)
 * a Payment's `Amount` field has three distinct legal forms:
 *   1. XRP — string of drops
 *   2. IOU — {currency, issuer, value} where `currency` is either
 *      a 3-char ASCII code (case-sensitive; letters, digits, and the
 *      symbols ? ! @ # $ % ^ & * < > ( ) { } [ ] |), or a 40-hex
 *      non-standard code. "XRP" is forbidden as an IOU code.
 *   3. MPT — {mpt_issuance_id, value} where the id is 48 hex chars
 *      (xrpl ≥ 4.x; xrpl 2.14 types don't model it but rippled emits it,
 *      so the getter detects MPT structurally).
 *
 * Tests build `XrpTransaction` from hand-crafted payloads — `currencyName`
 * only reads `TransactionType` and `Amount`, so no `meta` stub is needed.
 */

function makeTx(result: Record<string, unknown>): XrpTransaction {
    return new XrpTransaction({ result } as unknown as IXrpGetTransactionRes);
}

describe(`XrpTransaction.currencyName (${getTestFile(__filename)})`, function () {
    describe("XRP (native)", function () {
        it("returns 'XRP' when Amount is a drops string", function () {
            const tx = makeTx({ TransactionType: "Payment", Amount: "13100000" });
            expect(tx.currencyName).to.eq("XRP");
        });

        it("returns 'XRP' for the minimum drops amount", function () {
            const tx = makeTx({ TransactionType: "Payment", Amount: "1" });
            expect(tx.currencyName).to.eq("XRP");
        });

        it("returns 'XRP' for the protocol-max drops amount (10^17)", function () {
            const tx = makeTx({ TransactionType: "Payment", Amount: "100000000000000000" });
            expect(tx.currencyName).to.eq("XRP");
        });
    });

    describe("IOU — standard 3-char codes", function () {
        it("returns the code verbatim for uppercase ASCII letters", function () {
            const tx = makeTx({
                TransactionType: "Payment",
                Amount: { currency: "USD", issuer: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59", value: "1" },
            });
            expect(tx.currencyName).to.eq("USD");
        });

        it("preserves case (lowercase is distinct from uppercase)", function () {
            const tx = makeTx({
                TransactionType: "Payment",
                Amount: { currency: "usd", issuer: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59", value: "1" },
            });
            expect(tx.currencyName).to.eq("usd");
        });

        it("returns alphanumeric codes verbatim", function () {
            const tx = makeTx({
                TransactionType: "Payment",
                Amount: { currency: "CX1", issuer: "rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1", value: "10" },
            });
            expect(tx.currencyName).to.eq("CX1");
        });

        it("returns punctuation-bearing codes verbatim", function () {
            // Per spec the allowed punctuation set is ? ! @ # $ % ^ & * < > ( ) { } [ ] |
            const tx = makeTx({
                TransactionType: "Payment",
                Amount: { currency: "!@#", issuer: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59", value: "1" },
            });
            expect(tx.currencyName).to.eq("!@#");
        });
    });

    describe("IOU — nonstandard 40-hex codes", function () {
        it("passes through 40-hex codes without ASCII-decoding (CORE)", function () {
            // "434F524500000000000000000000000000000000" is hex-encoded ASCII
            // "CORE" padded with zeros. The library MUST NOT decode this —
            // 3-char and 40-hex forms must remain distinguishable downstream.
            const tx = makeTx({
                TransactionType: "Payment",
                Amount: {
                    currency: "434F524500000000000000000000000000000000",
                    issuer: "rcoreNywaoz2ZCQ8Lg2EbSLnGuRBmun6D",
                    value: "1",
                },
            });
            expect(tx.currencyName).to.eq("434F524500000000000000000000000000000000");
        });

        it("passes through 40-hex codes containing arbitrary bytes (DOLLARYDOO from docs)", function () {
            const tx = makeTx({
                TransactionType: "Payment",
                Amount: {
                    currency: "444F4C4C415259444F4F00000000000000000000",
                    issuer: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
                    value: "1",
                },
            });
            expect(tx.currencyName).to.eq("444F4C4C415259444F4F00000000000000000000");
        });
    });

    describe("MPT (Multi-Purpose Token)", function () {
        it("returns the mpt_issuance_id when Amount carries one (48-hex)", function () {
            // Example from
            // https://xrpl.org/docs/references/protocol/data-types/currency-formats
            // xrpl 2.14's TS types don't model this shape; the getter detects
            // it structurally so the branch fires on rippled-emitted data.
            const tx = makeTx({
                TransactionType: "Payment",
                Amount: {
                    mpt_issuance_id: "0000012FFD9EE5DA93AC614B4DB94D7E0FCE415CA51BED47",
                    value: "1000000",
                },
            });
            expect(tx.currencyName).to.eq("0000012FFD9EE5DA93AC614B4DB94D7E0FCE415CA51BED47");
        });
    });

    describe("non-Payment transactions", function () {
        it("returns '' for OfferCreate", function () {
            const tx = makeTx({
                TransactionType: "OfferCreate",
                TakerGets: "1000000",
                TakerPays: {
                    currency: "USD",
                    issuer: "rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1",
                    value: "5",
                },
            });
            expect(tx.currencyName).to.eq("");
        });

        it("returns '' for AccountDelete (even though it always settles in XRP)", function () {
            // TODO: a future tokenIdentifier getter should report XRP here.
            const tx = makeTx({
                TransactionType: "AccountDelete",
                Account: "r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy",
                Destination: "rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n",
            });
            expect(tx.currencyName).to.eq("");
        });
    });
});
