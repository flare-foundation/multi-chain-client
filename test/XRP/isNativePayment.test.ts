import { expect } from "chai";
import { XrpTransaction } from "../../src/base-objects";
import { IXrpGetTransactionRes } from "../../src/types/xrpTypes";
import { getTestFile } from "../testUtils";

/**
 * Unit tests for {@link XrpTransaction.isNativePayment}.
 *
 * Native = sending XRP and receiving XRP. Per rippled's `Payment::preflight`
 * (`xrpDirect = srcAsset.native() && dstAsset.native()`), this means
 *   - `Amount` (delivered) is XRP (string of drops), AND
 *   - `SendMax` (source max) is either absent or XRP (string of drops).
 *
 * Tests build `XrpTransaction` from hand-crafted payloads so they don't
 * depend on live network data.
 */

// Minimal stub that satisfies the metadata-touching getters used indirectly
// (none of these tests exercise spentAmounts / receivedAmounts).
const SUCCESS_META = {
    AffectedNodes: [],
    TransactionIndex: 0,
    TransactionResult: "tesSUCCESS",
};

function makeTx(result: Record<string, unknown>): XrpTransaction {
    return new XrpTransaction({ result } as unknown as IXrpGetTransactionRes);
}

describe(`XrpTransaction.isNativePayment (${getTestFile(__filename)})`, function () {
    it("returns true for a pure XRP→XRP Payment with no SendMax", function () {
        const tx = makeTx({
            TransactionType: "Payment",
            Account: "r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy",
            Destination: "rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n",
            Amount: "342390000",
            Fee: "45",
            hash: "75C7402BB60B574F7876627307EDACAA0A6830EB01692F150555999BDDBB4650",
            meta: SUCCESS_META,
        });

        expect(tx.isNativePayment).to.eq(true);
    });

    it("returns true when both Amount and SendMax are XRP strings", function () {
        // NOTE: this shape is purely theoretical — rippled rejects it at
        // preflight as `temBAD_SEND_XRP_MAX` (Amount=XRP combined with any
        // SendMax is malformed), so such a transaction cannot appear in a
        // validated ledger. The test documents the rule itself
        // (native iff Amount is string AND (SendMax undefined OR SendMax
        // is string)); it does not represent observable on-chain data.
        const tx = makeTx({
            TransactionType: "Payment",
            Account: "r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy",
            Destination: "rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n",
            Amount: "1000000",
            SendMax: "1000000",
            Fee: "10",
            hash: "AAAA000000000000000000000000000000000000000000000000000000000001",
            meta: SUCCESS_META,
        });

        expect(tx.isNativePayment).to.eq(true);
    });

    it("returns false when SendMax is an IssuedCurrencyAmount (cross-currency IOU→XRP)", function () {
        // Real testnet transaction:
        //   https://testnet.xrpl.org/transactions/CB7E1D062D8E08650B54E4C904ED3344B7CC52EB8CF6CF053AC265BBD2D4CA66
        // Destination receives XRP (Amount is a string of drops), but the
        // source debits a USD IOU (SendMax is an IssuedCurrencyAmount). This
        // is not an XRP→XRP payment and must not be classified as native.
        const tx = makeTx({
            Account: "rBBUxL9d68WF6pxEczcfNCY4fNqtDPC8be",
            Amount: "1000000",
            CredentialIDs: ["794D87E56A60783BE892FDA5E3371A95897B72052AC9AB94A5ABE8968ED772FE"],
            DeliverMax: "1000000",
            Destination: "rLe7NgT7GhbLGJ7RUfrH7zQezutWyNU3Md",
            DomainID: "FC052BBC0585BFEE8730FFFB31D9E9888A5D5CE15242C4522C690B1317C90A2B",
            Fee: "12",
            Flags: 0,
            LastLedgerSequence: 17281396,
            SendMax: {
                currency: "USD",
                issuer: "rQDqYo6X5gNJjHHGfbWQYcBZVFNcySXiC9",
                value: "5",
            },
            Sequence: 17281363,
            SigningPubKey: "EDCDCC5920BB7DD13372564DADB42DD1026C1D7A2507D852ABEFCC62ACFBF9BA69",
            TransactionType: "Payment",
            TxnSignature:
                "668E452C98A12A2E1002DB7AE8C54FE3CBF88B728214ADAABDA40AFFE6A2A8C049ABE686E90E657B96572DD5A370B1D2FAEE5753A8F5E1B781300493E8B54C0E",
            ctid: "C107B16200060001",
            date: 831814490,
            hash: "CB7E1D062D8E08650B54E4C904ED3344B7CC52EB8CF6CF053AC265BBD2D4CA66",
            inLedger: 17281378,
            ledger_index: 17281378,
            meta: {
                AffectedNodes: [],
                TransactionIndex: 6,
                TransactionResult: "tecNO_PERMISSION",
            },
        });

        expect(tx.isNativePayment).to.eq(false);
    });

    it("returns false for a token Payment (Amount is IssuedCurrencyAmount)", function () {
        const tx = makeTx({
            TransactionType: "Payment",
            Account: "rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1",
            Destination: "rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF",
            Amount: {
                currency: "USD",
                issuer: "rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1",
                value: "10",
            },
            Fee: "20",
            hash: "AAAA000000000000000000000000000000000000000000000000000000000002",
            meta: SUCCESS_META,
        });

        expect(tx.isNativePayment).to.eq(false);
    });

    it("returns false for a cross-currency XRP→IOU Payment (Amount=IOU, SendMax=XRP)", function () {
        const tx = makeTx({
            TransactionType: "Payment",
            Account: "rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1",
            Destination: "rP6JLXtRNs3tjeYnn7zUHpbfLjuyBXqhwF",
            Amount: {
                currency: "USD",
                issuer: "rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1",
                value: "5",
            },
            SendMax: "10000000",
            Fee: "20",
            hash: "AAAA000000000000000000000000000000000000000000000000000000000003",
            meta: SUCCESS_META,
        });

        expect(tx.isNativePayment).to.eq(false);
    });

    it("returns false when tfPartialPayment flag is set (Flags as number)", function () {
        // Defense-in-depth: rippled rejects this combination at preflight
        // (`temBAD_SEND_XRP_PARTIAL`), so it cannot appear in a validated
        // ledger. The test pins the local invariant — `isNativePayment`
        // refuses to classify any tfPartialPayment tx as native, so callers
        // can treat `Amount` as the delivered amount without inspecting flags.
        const tx = makeTx({
            TransactionType: "Payment",
            Account: "r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy",
            Destination: "rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n",
            Amount: "1000000",
            Flags: 0x00020000, // tfPartialPayment
            Fee: "10",
            hash: "AAAA000000000000000000000000000000000000000000000000000000000005",
            meta: SUCCESS_META,
        });

        expect(tx.isNativePayment).to.eq(false);
    });

    it("returns false when tfPartialPayment flag is set (Flags as object)", function () {
        // xrpl.js typing allows `Flags` to be a PaymentFlagsInterface object
        // (used during construction). Validated ledgers serialize Flags as a
        // number, so this shape shouldn't reach us — but the local guard
        // handles it defensively all the same.
        const tx = makeTx({
            TransactionType: "Payment",
            Account: "r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy",
            Destination: "rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n",
            Amount: "1000000",
            Flags: { tfPartialPayment: true },
            Fee: "10",
            hash: "AAAA000000000000000000000000000000000000000000000000000000000006",
            meta: SUCCESS_META,
        });

        expect(tx.isNativePayment).to.eq(false);
    });

    it("returns true when Flags is set but tfPartialPayment bit is not", function () {
        // Other Payment flags (e.g. tfNoDirectRipple = 0x00010000) do not
        // change native classification.
        const tx = makeTx({
            TransactionType: "Payment",
            Account: "r3zUhJWabAMMLT5n631r2wDh9RP3dN1bRy",
            Destination: "rpE6gE8jEN1trDwQwe47VmgDL5y6m3XX2n",
            Amount: "1000000",
            Flags: 0x00010000, // tfNoDirectRipple
            Fee: "10",
            hash: "AAAA000000000000000000000000000000000000000000000000000000000007",
            meta: SUCCESS_META,
        });

        expect(tx.isNativePayment).to.eq(true);
    });

    it("returns false for a non-Payment transaction (OfferCreate)", function () {
        const tx = makeTx({
            TransactionType: "OfferCreate",
            Account: "rETx8GBiH6fxhTcfHM9fGeyShqxozyD3xe",
            TakerGets: "1000000",
            TakerPays: {
                currency: "USD",
                issuer: "rBy7gEjA6AJytwZAUKYfXvGAf5Y1koFCX1",
                value: "5",
            },
            Fee: "20",
            hash: "AAAA000000000000000000000000000000000000000000000000000000000004",
            meta: SUCCESS_META,
        });

        expect(tx.isNativePayment).to.eq(false);
    });
});
