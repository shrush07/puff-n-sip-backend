const fs = require("fs");
const path = require("path");

// Copy public folder
const srcPublic = path.join(__dirname, "../src/public");
const distPublic = path.join(__dirname, "../dist/public");

if (fs.existsSync(srcPublic)) {
  fs.cpSync(srcPublic, distPublic, { recursive: true });
  console.log("Public folder copied");
}

// Copy .env
const envSrc = path.join(__dirname, "../.env");
const envDest = path.join(__dirname, "../dist/.env");

if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log(".env copied");
}