// Prints the SHA-256 hash of alu-logo.png
// Run: node scripts/hash-logo.js   (or pass another file path)
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const file = process.argv[2] || path.join(__dirname, "..", "alu-logo.png");

if (!fs.existsSync(file)) {
  console.error("Could not find " + file + ". Put the ALU logo in the project folder as alu-logo.png");
  process.exit(1);
}

const hex = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

console.log("File:            " + file);
console.log("SHA-256 (hex):   " + hex);
console.log("bytes32 value:   0x" + hex);
