import { MCC } from "../../src/index";
import { expect } from "chai";

const reg_tests_url = process.env.LTC_URL_REGTEST || "";
const reg_test_user = process.env.LTC_USERNAME_REGTEST || "";
const reg_test_pass = process.env.LTC_PASSWORD_REGTEST || "";

describe("LTC client tests", () => {
   describe("General functionalities", function () {
      it("should get block height from regtest network", async function () {
         const DogeRpc = new MCC.LTC({ url: reg_tests_url, username: reg_test_user, password: reg_test_pass });
         let a = await DogeRpc.getBlockHeight();
         console.log(a);

         expect(a).to.greaterThan(100);
      });

      // it('should get block height from regtest network', async function () {
      //   const DogeRpc = new MCC.LTC(reg_tests_url, reg_test_user, reg_test_pass);
      //   let a = await DogeRpc.getBlockHeight();

      //   expect(a).toBeGreaterThan(100);
      // });
   });
});
