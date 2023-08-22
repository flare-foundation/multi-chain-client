import { expect } from "chai";
import { mccSettings } from "../../src/global-settings/globalSettings";

describe("Global settings tests ", () => {
    it("set callbacks", () => {
        function loggingCallback(message: string): void {
            console.log(message);
        }
        function warningCallback(message: string): void {
            console.warn(message);
        }
        function errorCallback(message: string): void {
            console.error(message);
        }

        mccSettings.setLoggingCallback = loggingCallback;
        mccSettings.setWarningCallback = warningCallback;
        mccSettings.setErrorCallback = errorCallback;

        const expected = {
            loggingCallback: loggingCallback,
            warningCallback: warningCallback,
            errorCallback: errorCallback,
        };
        expect(mccSettings).to.be.eql(expected);
    });
});
