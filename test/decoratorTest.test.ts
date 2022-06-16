import { DecoratorTest } from "../src/utils/errors";
import { traceManager } from "../src/utils/trace";


describe("Decorator test", () => {
   let dec: DecoratorTest;

   before(async function () {
      traceManager.displayTrace=true;
      
      dec = new DecoratorTest();
   });

   afterEach( async function() {
      //traceManager.showTrace();
   });

   it("decorator function sync", async () => {
      console.log(`Res ${dec.method(5,6)}`);
   });

   it("decorator function async", async () => {
      console.log(`Result ${await dec.asyncMethod(7,8)}`);
   });

   it("decorator getter", async () => {
      console.log(dec.getter);
   });

   it("decorator throw sync", async () => {
      console.log(`Res ${dec.method(5,0)}`);
   });

   it("decorator throw async", async () => {
      console.log(`Result ${await dec.asyncMethod(7,0)}`);
   });


});
