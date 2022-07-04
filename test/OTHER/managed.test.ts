import { expect } from "chai";
import { disableManaged, enableManaged, TraceManager } from "../../src";


describe("Managed tests ", function () {
    it("should be disabled", () => {
        disableManaged();
        expect(TraceManager.enabled).to.be.false;
    });
    it("should be enabled", () => {
        enableManaged();
        expect(TraceManager.enabled).to.be.true;
    });


});