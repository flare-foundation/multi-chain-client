import { DecoratorTest } from "../src/utils/errors";


describe("Decorator test", () => {
   it("decorator", async () => {
      let dec = new DecoratorTest();
      console.log(`Res ${dec.method(5,6)}`)
      console.log(`Result ${await dec.asyncMethod(7,8)}`);
      console.log(dec.getter)
   });
});
