import { expect } from "chai";
import { disableManaged, enableManaged, Managed, TraceManager } from "../../src";
import { ManagedTest } from "../managedTest";

describe("Managed tests ", function () {
    it("Should be disabled", () => {
        disableManaged();
        expect(TraceManager.enabled).to.be.false;
        expect(Managed()(ManagedTest, "", "")).to.eql(ManagedTest);
    });
    it("Should be enabled", () => {
        enableManaged();
        expect(TraceManager.enabled).to.be.true;
    });

    it("Should return trace or class", () => {
        const desc = Object.getOwnPropertyDescriptor(ManagedTest.prototype, "setter");
        expect(Managed()(ManagedTest, "setter", desc)).to.eql(desc);

        const desc2 = Object.getOwnPropertyDescriptor(ManagedTest.prototype, "getter");
        expect(Managed()(ManagedTest, "getter", desc2)).to.eql(desc2);

        const desc3 = Object.getOwnPropertyDescriptor(ManagedTest.prototype, "constructor");
        expect(Managed()(ManagedTest, "constructor", desc3)).to.eql(ManagedTest);
    });
});
