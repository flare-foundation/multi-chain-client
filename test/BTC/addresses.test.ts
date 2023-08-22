import { assert, expect } from "chai";
import { createHash } from "crypto";
import { BTC_BASE_58_DICT_regex, btcBase58Decode } from "../../src";
import { BtcAddress } from "../../src/base-objects/addressObjects/BtcAddress";
import { bech32AddressToHex1, bech32AddressToHex2 } from "../../src/utils/bech32";
import { getTestFile } from "../testUtils";

const validAddressesBase58 = ["3EZBRrEk7JELP6c9LWNR2iJfFD91sr35ep", "3Nbxwjb9tBszckeF46PxbTqXNWtuei91Ti", "13Lf377cv9xm4KX2daMVmMQ751oqW3ZhWW"];
const validAddressesBech32 = [
    "BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4",
    "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7",
    "bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kt5nd6y",
    "BC1SW50QGDZ25J",
    "bc1zw508d6qejxtdg4y5r3zarvaryvaxxpcs",
];

describe(`addresses utils (${getTestFile(__filename)})`, function () {
    it("should decode address to hex", function () {
        //https://en.bitcoin.it/wiki/Bech32

        const addr = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";
        const addrHex1 = bech32AddressToHex1(addr);
        const addrHex2 = bech32AddressToHex2(addr);

        const exAddrHex1 = "751e76e8199196d454941c45d1b3a323f1433bd6";
        const exAddrHex2 = "000e140f070d1a001912060b0d081504140311021d030c1d03040f1814060e1e160c0709110b15";
        expect(addrHex1).to.eq(exAddrHex1);
        expect(addrHex2).to.eq(exAddrHex2);
    });

    it("isValid bech32", function () {
        for (const str of validAddressesBech32) {
            const address = new BtcAddress(str);

            assert(address.isValid());
        }
    });

    it("isValid base58", function () {
        for (const str of validAddressesBase58) {
            const address = new BtcAddress(str);

            assert(address.isValid());
        }
    });

    describe.skip("base58", function () {
        it("should decode base58", function () {
            const addr = "03PtoUcDtRGBg6HKVXo1DHnXhEspjzncmRw";
            const ima = BTC_BASE_58_DICT_regex.test(addr);
            console.log(ima, "regex");

            const decoded = btcBase58Decode(addr).toString("hex");

            const decodedtest = btcBase58Decode(addr);
            const preChecksum = decodedtest.slice(-4);
            const hash1 = createHash("sha256").update(decodedtest.slice(0, -4)).digest();
            const hash2 = createHash("sha256").update(hash1).digest();
            const newChecksum = hash2.slice(0, 4);

            console.log(preChecksum.equals(newChecksum));
            console.log(preChecksum, newChecksum);

            console.log(decoded);
        });
    });
});
