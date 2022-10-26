import { expect } from "chai";
import Web3 from "web3";
import {
   camelToSnakeCase,
   defaultExceptionCallback,
   defaultLoggingCallback,
   defaultMccLoggingObject,
   defaultWarningCallback,
   fillWithDefault,
   getSimpleRandom,
   isPrefixed0x,
   sleepMs,
   toBN,
   toHex,
   toNumber,
   toSnakeCase,
   unPrefix0x,
} from "../../src";
const stdout = require("test-console").stdout;
const stderr = require("test-console").stderr;
const chai = require("chai");
chai.use(require("chai-as-promised"));

describe("Utils tests ", () => {
   it("should return '0x0' if no tx", () => {
      const expected = "0x0";
      const res = unPrefix0x("");
      expect(res).to.be.equal(expected);
   });

   it("should return false if no tx", () => {
      const res = isPrefixed0x("");
      expect(res).to.be.false;
   });

   it("should return undefined", () => {
      const expected = undefined;
      const res = toNumber(undefined);
      expect(res).to.be.equal(expected);
   });

   it("should return undefined", () => {
      const expected = undefined;
      const res = toNumber(null);
      expect(res).to.be.equal(expected);
   });

   it("should return number", () => {
      const expected = 1;
      const res = toNumber(expected);
      expect(res).to.be.equal(expected);
   });

   it("should return number", () => {
      const expected = 1;
      const res = toNumber(Web3.utils.toBN(1));
      expect(res).to.be.equal(expected);
   });

   it("should return snakecase", () => {
      const expected = "this-is-my-project";
      const res = camelToSnakeCase("thisIsMyProject");
      expect(res).to.be.equal(expected);
   });

   it("should return snakecase from camelcase", () => {
      const expected = "this:is:my:project";
      const res = camelToSnakeCase("thisIsMyProject", ":");
      expect(res).to.be.equal(expected);
   });

   it("should return snakecase", () => {
      const expected = { "first:argument": "thisIsMyProject", "second:argument": 2, 3: { "deep:argument": "deepProject" } };
      const obj = { firstArgument: "thisIsMyProject", secondArgument: 2, 3: { deepArgument: "deepProject" } };
      const res = toSnakeCase(obj, ":");
      expect(res).to.be.eql(expected);
   });

   it("should return snakecase", () => {
      const expected = { "first-argument": "thisIsMyProject", "second-argument": 2, 3: { "deep-argument": "deepProject" } };
      const obj = { firstArgument: "thisIsMyProject", secondArgument: 2, 3: { deepArgument: "deepProject" } };
      const res = toSnakeCase(obj);
      expect(res).to.be.eql(expected);
   });

   it("should return error", () => {
      const fn = () => {
         return toBN(1.0194e21, false);
      };
      expect(fn).to.throw(Error);
   });

   it("should return 0", () => {
      const expected = Web3.utils.toBN(0);
      const res = toBN(1.0194e21, true);
      expect(res).to.be.eql(expected);
   });

   it("should return BN", () => {
      const expected = Web3.utils.toBN(1);
      const res = toBN(expected);
      expect(res).to.be.eql(expected);
   });

   it("should return hex", () => {
      expect(toHex("2022")).to.be.eq("0x7e6");
   });

   it("should return hex 2", () => {
      expect(toHex(2022)).to.be.eq("0x7e6");
   });

   it("should return hex 3", () => {
      const bn = Web3.utils.toBN(toHex(2022));
      expect(toHex(bn)).to.be.eq("0x7e6");
   });

   it("should return defaultMccLoggingObject", () => {
      const expected = {
         mode: "develop",
         loggingCallback: defaultLoggingCallback,
         warningCallback: defaultWarningCallback,
         exceptionCallback: defaultExceptionCallback,
      };
      const res = defaultMccLoggingObject();
      expect(res).to.be.eql(expected);
   });

   it("should return fillWithDefault with empty object", () => {
      const expected = {
         mode: "develop",
         loggingCallback: defaultLoggingCallback,
         warningCallback: defaultWarningCallback,
         exceptionCallback: defaultExceptionCallback,
      };
      const res = fillWithDefault({});
      expect(res).to.be.eql(expected);
   });

   it("should return fillWithDefault with set mode", () => {
      const expected = {
         mode: "off",
         loggingCallback: defaultLoggingCallback,
         warningCallback: defaultWarningCallback,
         exceptionCallback: defaultExceptionCallback,
      };
      const res = fillWithDefault({ mode: "off" });
      expect(res).to.be.eql(expected);
   });

   it("should return fillWithDefault with set callbacks", () => {
      function justLikeDefaultLoggingCallback(message: string): void {
         console.log(message);
      }
      function justLikeDefaultWarningCallback(message: string): void {
         console.log(message);
      }
      function justLikeDefaultExceptionCallback(error: any, message: string): void {
         console.log(message);
         console.error(error);
         if (error.stack) {
            console.error(error.stack);
         }
      }
      const expected = {
         mode: "off",
         loggingCallback: justLikeDefaultLoggingCallback,
         warningCallback: justLikeDefaultWarningCallback,
         exceptionCallback: justLikeDefaultExceptionCallback,
      };
      const res = fillWithDefault({
         mode: "off",
         loggingCallback: justLikeDefaultLoggingCallback,
         warningCallback: justLikeDefaultWarningCallback,
         exceptionCallback: justLikeDefaultExceptionCallback,
      });
      expect(res).to.be.eql(expected);
   });

   it("should eventually return ", async () => {
      await expect(sleepMs(1000)).to.eventually.be.fulfilled;
   });

   it("should return ", async () => {
      const n = 123;
      const res = getSimpleRandom(n);
      expect(res).not.to.equal(n);
   });

   describe("Functions with console.log()", () => {
      it("should log", () => {
         const output = stdout.inspectSync(() => {
            defaultLoggingCallback("New message");
         });
         expect(output).to.be.eql(["New message\n"]);
      });

      it("should log", () => {
         const output = stdout.inspectSync(() => {
            defaultWarningCallback("New message");
         });
         expect(output).to.be.eql(["New message\n"]);
      });

      it("should log", () => {
         const output = stdout.inspectSync(() => {
            defaultExceptionCallback({}, "New message");
         });
         const outputErr = stderr.inspectSync(() => {
            defaultExceptionCallback({ stack: "New stack" }, "New message");
         });
         expect(output).to.be.eql(["New message\n"]);
         expect(outputErr[1]).to.be.equal("New stack\n");
         expect(outputErr[0]).contains("New stack");
      });
   });
});
