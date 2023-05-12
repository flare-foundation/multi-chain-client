import * as fs from "fs";
import * as path from "path";

const HARDCODED_EXPECTED_TRANSACTIONS_COUNT = 24;

export async function checkTransactionTypes(): Promise<boolean> {
   // Iterate over all files in folder that end with .d.ts
   const transactionTypes = [];
   // check if folder exists
   if (!fs.existsSync(path.join(__dirname, "..", "..", "node_modules", "xrpl", "dist", "npm", "models", "transactions"))) {
      console.log("Transactions folder does not exist");
      return false;
   }
   const files = fs.readdirSync(path.join(__dirname, "..", "..", "node_modules", "xrpl", "dist", "npm", "models", "transactions"));
   for (const file of files) {
      if (file.endsWith(".d.ts")) {
         // Open file and read contents and parse line that contains "TransactionType"
         const fileContents = fs.readFileSync(path.join(__dirname, "..", "..", "node_modules", "xrpl", "dist", "npm", "models", "transactions", file), "utf8");
         const lines = fileContents.split("\n");
         const isExtendingBaseTransaction = lines.find((line) => line.includes("extends BaseTransaction"));
         if (!isExtendingBaseTransaction) {
            // console.log("File does not extend BaseTransaction: ", file);
            continue;
         }
         const transactionTypeLine = lines.find((line) => line.includes("TransactionType"));
         if (!transactionTypeLine) {
            console.log("Transaction Type Line not found for file: ", file);
            continue;
         }
         // parse out the transaction type using regular expressions
         const transactionTypeMatch = transactionTypeLine.match(/TransactionType: '(.*)';/);
         if (!transactionTypeMatch || !transactionTypeMatch[1]) {
            console.log("Transaction Type Match not found for file: ", file);
            continue;
         }
         const transactionType = transactionTypeMatch[1];
         transactionTypes.push(transactionType);
      }
   }

   if (transactionTypes.length !== HARDCODED_EXPECTED_TRANSACTIONS_COUNT) {
      console.log("Expected transaction types count does not match actual count");
      return false;
   }

   //  console.log("Transaction Types: ", transactionTypes);

   // open and read src/types/xrpTypes.ts and parse out the union type called XrpTransactionTypeUnion
   const xrpTypesFileContents = fs.readFileSync(path.join(__dirname, "..", "..", "src", "types", "xrpTypes.ts"), "utf8").replace(/(\r\n|\n|\r)/gm, "");
   const xrpTransactionTypeUnionMatch = xrpTypesFileContents.match(/XrpTransactionTypeUnion =([^;]*);/);
   if (!xrpTransactionTypeUnionMatch || !xrpTransactionTypeUnionMatch[1]) {
      console.log("XrpTransactionTypeUnion Match not found");
      return false;
   }

   // transaction type parsed options:
   const rawTransactionTypes = xrpTransactionTypeUnionMatch[1];
   const parsedTypes = rawTransactionTypes.split("|").map((type) => {
      return type.trim().replace(/'/g, "").replace(/"/gi, "");
   });
   //  console.log("Parsed Types: ", parsedTypes);

   // compare the two lists
   for (const v of transactionTypes) {
      if (v === "") {
         continue;
      }
      if (!parsedTypes.includes(v)) {
         console.log(`Transaction Type ${v} not found in parsedTypes: `);
         return false;
      }
   }
   for (const v of parsedTypes) {
      if (v === "") {
         continue;
      }
      if (!transactionTypes.includes(v)) {
         console.log("Transaction Type not found in XrpTransactionTypeUnion: ", v);
         return false;
      }
   }

   return true;
}
