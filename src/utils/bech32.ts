import Web3 from "web3";
import { toHex, unPrefix0x } from "./utils";

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
type encoding = "bech32" | "bech32m";

type hrp = "bc" | "tb";

function isHrp(str: string): str is hrp {
   return str == "bc" || str == "tb";
}

// According to bip 173 (bech32) https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
// and bip 350 (bech32m) https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki

function getEncodingConst(enc: encoding) {
   if (enc == "bech32") {
      return 1;
   } else if (enc == "bech32m") {
      return 0x2bc830a3;
   }
}

function polyMod(values: string | any[]) {
   let chk = 1;
   for (let p = 0; p < values.length; ++p) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ values[p];
      for (let i = 0; i < 5; ++i) {
         if ((top >> i) & 1) {
            chk ^= GENERATOR[i];
         }
      }
   }
   return chk;
}

export function hrpExpand(hrp: hrp) {
   const ret = [];
   let p;
   for (p = 0; p < hrp.length; ++p) {
      ret.push(hrp.charCodeAt(p) >> 5);
   }
   ret.push(0);
   for (p = 0; p < hrp.length; ++p) {
      ret.push(hrp.charCodeAt(p) & 31);
   }
   return ret;
}

function verifyChecksum(hrp: hrp, data: number[], enc: encoding) {
   return polyMod(hrpExpand(hrp).concat(data)) === getEncodingConst(enc);
}

function createChecksum(hrp: hrp, data: number[], enc: encoding) {
   const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
   const encConst = getEncodingConst(enc);
   if (!encConst) return null;
   const mod = polyMod(values) ^ encConst;
   const ret = [];
   for (let p = 0; p < 6; ++p) {
      ret.push((mod >> (5 * (5 - p))) & 31);
   }
   return ret;
}

export function bech32_encode(hrp: hrp, data: number[], enc: encoding) {
   const checksum = createChecksum(hrp, data, enc);
   if (!checksum) return null;
   const combined = data.concat(checksum);
   let ret = hrp + "1";
   for (let p = 0; p < combined.length; ++p) {
      ret += CHARSET.charAt(combined[p]);
   }
   return ret;
}

//without checksum
export function bech32_decode(bechString: string, enc: encoding) {
   let p;
   let has_lower = false;
   let has_upper = false;
   for (p = 0; p < bechString.length; ++p) {
      if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
         return null;
      }
      if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
         has_lower = true;
      }
      if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
         has_upper = true;
      }
   }
   if (has_lower && has_upper) {
      return null;
   }
   bechString = bechString.toLowerCase();
   const pos = bechString.lastIndexOf("1");
   if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
      return null;
   }
   const hrp = bechString.substring(0, pos);
   if (!isHrp(hrp)) return null;
   const data = [];
   for (p = pos + 1; p < bechString.length; ++p) {
      const d = CHARSET.indexOf(bechString.charAt(p));
      if (d === -1) {
         return null;
      }
      data.push(d);
   }
   if (!verifyChecksum(hrp, data, enc)) {
      return null;
   }
   return { hrp: hrp, data: data.slice(0, data.length - 6) };
}

export function bech32_decodeWithCheckSum(bechString: string, enc: encoding) {
   let p;
   let has_lower = false;
   let has_upper = false;
   for (p = 0; p < bechString.length; ++p) {
      if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
         return null;
      }
      if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
         has_lower = true;
      }
      if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
         has_upper = true;
      }
   }
   if (has_lower && has_upper) {
      return null;
   }
   bechString = bechString.toLowerCase();
   const pos = bechString.lastIndexOf("1");
   if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
      return null;
   }
   const hrp = bechString.substring(0, pos);
   if (!isHrp(hrp)) return null;
   const data = [];
   for (p = pos + 1; p < bechString.length; ++p) {
      const d = CHARSET.indexOf(bechString.charAt(p));
      if (d === -1) {
         return null;
      }
      data.push(d);
   }
   if (!verifyChecksum(hrp, data, enc)) {
      return null;
   }
   return { hrp: hrp, data: data.slice(0, data.length) };
}

export function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean) {
   let acc = 0;
   let bits = 0;
   const ret = [];
   const maxv = (1 << toBits) - 1;
   for (let p = 0; p < data.length; ++p) {
      const value = data[p];
      if (value < 0 || value >> fromBits !== 0) {
         return null;
      }
      acc = (acc << fromBits) | value;
      bits += fromBits;
      while (bits >= toBits) {
         bits -= toBits;
         ret.push((acc >> bits) & maxv);
      }
   }
   if (pad) {
      if (bits > 0) {
         ret.push((acc << (toBits - bits)) & maxv);
      }
   } else if (bits >= fromBits || (acc << (toBits - bits)) & maxv) {
      return null;
   }
   return ret;
}

export function bech32Decode(addr: string) {
   let bech32m = false;
   let dec = bech32_decode(addr, "bech32");
   if (dec === null) {
      dec = bech32_decode(addr, "bech32m");
      bech32m = true;
   }

   if (dec === null || dec.data.length < 1 || dec.data[0] > 16) {
      return null;
   }
   const res = convertBits(dec.data.slice(1), 5, 8, false);
   if (res === null || res.length < 2 || res.length > 40) {
      return null;
   }
   if (dec.data[0] === 0 && res.length !== 20 && res.length !== 32) {
      return null;
   }

   if (dec.data[0] === 0 && bech32m) {
      return null;
   }
   if (dec.data[0] !== 0 && !bech32m) {
      return null;
   }

   return { version: dec.data[0], program: res };
}

export function bech32Encode(hrp: hrp, version: number, program: number[]) {
   let enc: encoding = "bech32";
   if (version > 0) {
      enc = "bech32m";
   }
   const bits = convertBits(program, 8, 5, true);
   if (!bits) return null;
   const ret = bech32_encode(hrp, [version].concat(bits), enc);
   if (!ret || bech32Decode(ret) === null) {
      return null;
   }
   return ret;
}

export function bech32AddressToHex1(address: string) {
   const decode = bech32Decode(address);
   if (!decode) throw new Error("invalid address");
   const data = decode.program.map((num: number) => unPrefix0x(Web3.utils.padLeft(toHex(num), 2))).join("");
   return data;
}

export function bech32AddressToHex2(address: string) {
   let bech32m = false;
   let dec = bech32_decodeWithCheckSum(address, "bech32");
   if (dec === null) {
      dec = bech32_decodeWithCheckSum(address, "bech32m");
      bech32m = true;
   }

   if (dec === null || dec.data.length < 1 || dec.data[0] > 16) {
      return null;
   }

   if (dec.data[0] === 0 && bech32m) {
      return null;
   }
   if (dec.data[0] !== 0 && !bech32m) {
      return null;
   }

   const addressHex = dec.data.map((num: number) => unPrefix0x(Web3.utils.padLeft(toHex(num), 2))).join("");
   return addressHex;
}

/**
 * Returns pkscript corresponding to a bech32 address.
 * @param address in bech32 or bech32m
 * @returns
 */
export function bech32AddressToPkscript(address: string) {
   const decode = bech32Decode(address);

   if (!decode) throw new Error("invalid address");
   const length = unPrefix0x(toHex(decode.program.length));
   const data = decode.program.map((num: number) => unPrefix0x(Web3.utils.padLeft(toHex(num), 2)));
   let prefix = "00";
   if (decode.version) {
      prefix = unPrefix0x(toHex(decode.version + 80));
   }
   const pkscript = [prefix, length].concat(data).join("");
   return pkscript;
}

// export function isValidAddress(address: string, hrp: string) {
//    hrp = hrp || "bc";
//    let ret = bech32Decode(hrp, address);

//    if (ret === null) {
//       hrp = "tb";
//       ret = bech32Decode(hrp, address);
//    }

//    if (ret === null) {
//       return false;
//    }

//    const recreate = bech32Encode(hrp, ret.version, ret.program);
//    return recreate === address.toLowerCase();
// }

// export function programToHexConcat(program: number[]): string {}
