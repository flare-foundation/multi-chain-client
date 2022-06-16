import { mccError, mccErrorCode } from "../src/utils/errors";
import { Managed } from "../src/utils/managed";

@Managed()
export class ManagedTest {
    val = 3;
    constructor() {
        console.log("Constructor");
    }

    get getter() {
        console.log("Getter");
        return 1;
    }

    get getterThrow() {
        console.log("GetterThrow");
        throw new Error("test crash");
        return 1;
    }

    set setter(a: number) {
        this.val = a;
    }

    set setterThrow(a: number) {
        throw new Error("test crash");
    }


    method(a: number, b: number) {
        return this.sum(a, this.mad(a, a, b));
    }

    methodThrow(a: number, b: number) {
        throw new Error("test crash");
    }

    methodThrowMccError() {
        throw new mccError(mccErrorCode.InvalidData);
    }


    mad(a: number, b: number, c: number) {
        return a * b + c;
    }

    sum(a: number, b: number) {
        return a + b;
    }

    mul(a: number, b: number) {
        return a * b;
    }

    async asyncMethod(a: number, b: number) {
        return this.mul(this.sum(a, a), this.sum(b, b));
    }

    async asyncMethodThrow(a: number, b: number) {
        throw new Error("test crash");
    }

}