import { expect } from "chai";
import { parseDependencyTree, parseCircular, prettyCircular } from "dpdm";
import { getTestFile } from "./testUtils";

describe(`Circular dependencies (${getTestFile(__filename)})`, function () {
   it("Should not have circular dependencies", async function () {
      const tree = await parseDependencyTree("./src/index.ts", {
         // Transform typescript to javascript before checking for circular dependencies (avoid type circular deps)
         transform: true,
      });
      const circulars = parseCircular(tree);
      const prettyCircularRes = prettyCircular(circulars);
      expect(prettyCircularRes).to.eq("");
   });
});
