import { toHex } from "../../src";
import { bech32AddressToPkscript, bech32Decode, bech32_decode, bech32_encode, hrpExpand } from "../../src/utils/bech32";

describe("addresses utils", function () {
   it("should expand hrp", function () {
      const decode = bech32Decode("tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7");
      console.log(decode);
      console.log(decode?.program.map(toHex));
      let addrHex = bech32AddressToPkscript("tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7");
      console.log(addrHex);
   });
});
