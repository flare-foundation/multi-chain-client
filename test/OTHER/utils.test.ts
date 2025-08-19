import chai, { expect } from "chai";
import {
    defaultExceptionCallback,
    defaultLoggingCallback,
    defaultMccLoggingObject,
    defaultWarningCallback,
    fillWithDefault,
    getSimpleRandom,
    isPrefixed0x,
    sleepMs,
    standardAddressHash,
    toHex,
    unPrefix0x,
} from "../../src";
import { getTestFile } from "../testUtils";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe(`Utils tests ,(${getTestFile(__filename)})`, () => {
    it("should return '0x0' if no tx", () => {
        const expected = "0x0";
        const res = unPrefix0x("");
        expect(res).to.be.equal(expected);
    });

    it("should return false if no tx", () => {
        const res = isPrefixed0x("");
        expect(res).to.be.false;
    });

    it("should return hex 2022 as string", () => {
        expect(toHex("2022")).to.be.eq("0x7e6");
    });

    it("should return hex 10 as string", () => {
        expect(toHex("10")).to.be.eq("0xa");
    });

    it("should return hex 2022 as number", () => {
        expect(toHex(2022)).to.be.eq("0x7e6");
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

    // describe("Functions with console.log()", () => {
    //     it("should log", () => {
    //         const output = stdout.inspectSync(() => {
    //             defaultLoggingCallback("New message");
    //         });
    //         expect(output).to.be.eql(["New message\n"]);
    //     });

    //     it("should log", () => {
    //         const output = stdout.inspectSync(() => {
    //             defaultWarningCallback("New message");
    //         });
    //         expect(output).to.be.eql(["New message\n"]);
    //     });

    //     it("should log", () => {
    //         const output = stdout.inspectSync(() => {
    //             defaultExceptionCallback({}, "New message");
    //         });
    //         const outputErr = stderr.inspectSync(() => {
    //             defaultExceptionCallback({ stack: "New stack" }, "New message");
    //         });
    //         expect(output).to.be.eql(["New message\n"]);
    //         expect(outputErr[1]).contains("New stack");
    //         expect(outputErr[0]).contains("New stack");
    //     });
    // });

    it("Should correctly format standard address hash", () => {
        const a = standardAddressHash("web3.js");
        expect(a).to.eq("0x63667efb1961039c9bb0d6ea7a5abdd223a3aca7daa5044ad894226e1f83919a");
    });
});
