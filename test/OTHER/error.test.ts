import { expect } from "chai";
import { mccError, mccErrorCode } from "../../src/utils/errors";


describe("Error tests ", function () {
    it("Should be disabled", () => {
        let err = new mccError(mccErrorCode.InvalidData);
        delete err.stack;
        expect(err.toString()).to.include("mccError:InvalidData");
    });


});