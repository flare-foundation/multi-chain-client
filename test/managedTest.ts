import { sleepMs, traceFunction } from "../src";
import { mccError, mccErrorCode } from "../src/utils/errors";
import { Managed } from "../src/utils/managed";

export function TestFunctionCall(a: number, s: string) {
   traceFunction(TestFunction, a, s);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function TestFunction(a: number, s: string) {}

export class Test2 {
   async test2() {
      return 5;
   }
}

@Managed()
export class ManagedTest {
   val = 3;
   constructor() {
      console.log("ManagedTest Constructor");
   }

   get getter() {
      console.log("ManagedTest Getter");
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

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async asyncMethodThrow(a: number, b: number) {
      throw new Error("test crash");
   }

   // async nested test

   async asyncNestedMethod() {
      const promises = [];
      for (let a = 0; a < 10; a++) {
         promises.push(this.asyncMethod3(a));
      }
      return promises;
   }

   async asyncNestedMethodAwait() {
      for (let a = 0; a < 10; a++) {
         await this.asyncMethod3(a);
      }
   }

   async asyncNestedMethodWaitOnEnd() {
      const promises = [];

      for (let a = 0; a < 3; a++) {
         promises.push(this.asyncMethod3(a));
      }

      await Promise.all(promises);
   }

   async asyncMethod3(a: number) {
      for (let i = 0; i < 3; i++) {
         this.f0(a, i);
         await sleepMs(10);
      }
   }

   // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
   f0(a: number, b: number) {}

   //

   f1(param: string) {
      this.f2(`f1(${param})->f2`);
      this.f3(`f1(${param})->f3`);
   }

   f2(param: string) {
      this.f3(`f2(${param})->f3`);
   }

   f3(param: string) {
      for (let a = 0; a < 3; a++) {
         this.f4(`f3(${param})->f4(${a})`);
      }
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
   f4(param: string) {}
}
