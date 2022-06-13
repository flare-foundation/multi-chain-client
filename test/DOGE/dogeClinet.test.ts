import { MCC } from "../../src/index";
import { RPCInterface } from "../../src/types";
import { expect } from "chai";

const reg_tests_url = process.env.DOGE_URL_REGTEST || "";
const reg_test_user = process.env.DOGE_USERNAME_REGTEST || "";
const reg_test_pass = process.env.DOGE_PASSWORD_REGTEST || "";

const ENABLE_REG_TEST = true;

describe("DOGE client tests", () => {
   describe("General functionalities", function () {
      it("should get block height from regtest network", async function () {
         const DogeRpc = new MCC.DOGE({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass });
         let a = await DogeRpc.getBlockHeight();
         expect(a).to.greaterThan(100);
      });
   });

   if (ENABLE_REG_TEST) {
      describe("Prove transaction on reg test node", function () {
         let DOGE_RPC: RPCInterface;
         before(function () {
            DOGE_RPC = new MCC.DOGE({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass });
         });

         it("should get transaction data", async function () {
            // Note that this transaction may not exist if we reset the node
            let tx = "242cd280ec9ce026900d18665b296c784f15ce22360296655bcdfedd55ffbec4";
            let tx_data = await DOGE_RPC.getTransaction(tx, { verbose: true });
            const tx_block_hash = "011b06ce85759bcd0ca7e9eb60d55b4e267686d26b8f00607ac8271c86f85e34";
            expect(tx_data.blockhash).to.equal(tx_block_hash);
         });
      });
   }
});
