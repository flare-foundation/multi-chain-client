import { traceManager } from "../src/utils/trace";
import { ManagedTest, TestFunctionCall } from "./managedTest";

const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))


describe("Managed test", () => {
   let dec: ManagedTest;

   before(async function () {
      //traceManager.displayTrace=true;

      dec = new ManagedTest();
   });

   beforeEach(async function () {
      traceManager.clearTrace();
   });

   afterEach(async function () {
      //traceManager.showTrace();
   });

   after(async function () {
      traceManager.displayTrace=false;
   })


   it("Managed method sync", async () => {
      dec.method(5, 6);

      expect(traceManager.firstTrace).to.eq(`ManagedTest.method(5,6)=36`);
   });

   it("Managed method async", async () => {
      await dec.asyncMethod(7, 8);

      expect(traceManager.firstTrace).to.eq(`ManagedTest.asyncMethod(7,8)=224`);
   });

   it("Managed getter", async () => {
      dec.getter;

      expect(traceManager.firstTrace).to.eq(`ManagedTest.getter()=1`);
   });

   it("Managed setter", async () => {
      dec.setter = 15;

      expect(traceManager.firstTrace).to.eq(`ManagedTest.setter(15)`);
   });



   it("Managed throw sync", async () => {
      expect(function () { dec.methodThrow(5, 0); }).to.throw("OutsideError");

      expect(traceManager.firstTrace).to.eq(`ManagedTest.methodThrow(5,0)`);
   });

   it("Managed throw sync mcc error", async () => {
      expect(function () { dec.methodThrowMccError(); }).to.throw("InvalidData");

      expect(traceManager.firstTrace).to.eq(`ManagedTest.methodThrowMccError()`);
   });

   it("Managed throw async", async () => {
      await expect( dec.asyncMethodThrow(7, 0) ).to.be.rejectedWith("OutsideError");

      expect(traceManager.firstTrace).to.eq(`ManagedTest.asyncMethodThrow(7,0)`);
   });

   it("Managed throw getter", async () => {
      expect(function () {
         dec.getterThrow;
      }).to.throw("OutsideError");

      expect(traceManager.firstTrace).to.eq(`ManagedTest.getterThrow()`);
   });

   it("Managed throw setter", async () => {
      expect(function () { dec.setterThrow = 15; }).to.throw("OutsideError");

      expect(traceManager.firstTrace).to.eq(`ManagedTest.setterThrow(15)`);
   });


   it.only("Managed function", async () => {


      TestFunctionCall( 1 , "A" );

      traceManager.showTrace(true,false,true);
      traceManager.showMethods();

      expect(traceManager.firstTrace).to.eq(`.TestFunction(1,A)`);
   });





   it("Managed nested test", async () => {

      //traceManager.displayTrace=true;

      dec.f1("123");

      traceManager.showTrace(true,false,true);
      traceManager.showMethods();

      expect(traceManager.firstTrace).to.eq(`ManagedTest.f1(123)`);
   });



});
