const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

// According to bip 173 https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
function polymod(values: string | any[]) {
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

function hrpExpand(hrp: string) {
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

function verifyChecksum(hrp: any, data: ConcatArray<number>) {
   return polymod(hrpExpand(hrp).concat(data)) === 1;
}

function createChecksum(hrp: any, data: ConcatArray<number>) {
   const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
   const mod = polymod(values) ^ 1;
   const ret = [];
   for (let p = 0; p < 6; ++p) {
      ret.push((mod >> (5 * (5 - p))) & 31);
   }
   return ret;
}

export function bech32_encode(hrp: string, data: any[]) {
   const combined = data.concat(createChecksum(hrp, data));
   let ret = hrp + "1";
   for (let p = 0; p < combined.length; ++p) {
      ret += CHARSET.charAt(combined[p]);
   }
   return ret;
}

export function bech32_decode(bechString: string) {
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
   const data = [];
   for (p = pos + 1; p < bechString.length; ++p) {
      const d = CHARSET.indexOf(bechString.charAt(p));
      if (d === -1) {
         return null;
      }
      data.push(d);
   }
   if (!verifyChecksum(hrp, data)) {
      return null;
   }
   return { hrp: hrp, data: data.slice(0, data.length - 6) };
}

export function convertbits(data: any, frombits: any, tobits: any, pad: any) {
   let acc = 0;
   let bits = 0;
   const ret = [];
   const maxv = (1 << tobits) - 1;
   for (let p = 0; p < data.length; ++p) {
      const value = data[p];
      if (value < 0 || value >> frombits !== 0) {
         return null;
      }
      acc = (acc << frombits) | value;
      bits += frombits;
      while (bits >= tobits) {
         bits -= tobits;
         ret.push((acc >> bits) & maxv);
      }
   }
   if (pad) {
      if (bits > 0) {
         ret.push((acc << (tobits - bits)) & maxv);
      }
   } else if (bits >= frombits || (acc << (tobits - bits)) & maxv) {
      return null;
   }
   return ret;
}

export function bech32Decode(hrp: any, addr: any) {
   const dec = bech32_decode(addr);
   if (dec === null || dec.hrp !== hrp || dec.data.length < 1 || dec.data[0] > 16) {
      return null;
   }
   const res = convertbits(dec.data.slice(1), 5, 8, false);
   if (res === null || res.length < 2 || res.length > 40) {
      return null;
   }
   if (dec.data[0] === 0 && res.length !== 20 && res.length !== 32) {
      return null;
   }
   return { version: dec.data[0], program: res };
}

export function encode(hrp: any, version: any, program: number[]) {
   const ret = bech32_encode(hrp, [version].concat(convertbits(program, 8, 5, true)));
   if (bech32Decode(hrp, ret) === null) {
      return null;
   }
   return ret;
}

export function isValidAddress(address: string, hrp: string) {
   hrp = hrp || "bc";
   let ret = bech32Decode(hrp, address);

   if (ret === null) {
      hrp = "tb";
      ret = bech32Decode(hrp, address);
   }

   if (ret === null) {
      return false;
   }

   const recreate = encode(hrp, ret.version, ret.program);
   return recreate === address.toLowerCase();
}
