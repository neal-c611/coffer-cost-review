#!/usr/bin/env node
// Remove the Coffer cost-review skill on package uninstall.

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const dest = path.join(os.homedir(), ".claude", "skills", "coffer-cost-review");
if (fs.existsSync(dest)) {
  try {
    fs.rmSync(dest, { recursive: true, force: true });
    if (!process.argv.includes("--silent")) {
      console.log(`coffer-cost-review: removed ${dest}`);
    }
  } catch (err) {
    if (!process.argv.includes("--silent")) {
      console.error(`coffer-cost-review: failed to remove ${dest}: ${err}`);
    }
  }
}
