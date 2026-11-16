const fs = require("fs");
const path = require("path");

// Copy public folder
const srcPublic = path.join(__dirname, "../src/public");
const distPublic = path.join(__dirname, "../dist/public");

if (fs.existsSync(srcPublic)) {
  fs.cpSync(srcPublic, distPublic, { recursive: true });
  console.log("Public folder copied");
}