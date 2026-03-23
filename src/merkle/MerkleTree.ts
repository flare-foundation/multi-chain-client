import { singleHash, MerkleTree } from "@flarenetwork/js-flare-common";
import { ZERO_BYTES_32 } from "../utils/utils";

function decodeAsciiString(str: string) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

export function merkleTreeFromAddressStrings(addresses: (string | undefined)[]): MerkleTree {
    const hashedAddresses = [];
    for (const address of addresses) {
        if (address === undefined) {
            hashedAddresses.push(ZERO_BYTES_32);
        } else {
            hashedAddresses.push(singleHash(singleHash(decodeAsciiString(address))));
        }
    }
    return new MerkleTree(hashedAddresses);
}
