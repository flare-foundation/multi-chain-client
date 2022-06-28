import { expect } from "chai";
import { disableManaged, TraceManager } from "../../src";


describe("Managed tests ", function () {
    it("should be enabled", () => {
        expect(TraceManager.enabled).to.be.true;
    });
    it("should be disabled", () => {
        disableManaged();
        expect(TraceManager.enabled).to.be.false;
    });
});