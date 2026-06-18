#!/usr/bin/env node
// Install the Coffer cost-review skill into ~/.claude/skills/.
//
// Usage:
//   npm i -g coffer-cost-review        (postinstall runs this automatically)
//   npx coffer-cost-review              (no global install needed)
//   coffer-cost-review                  (if installed globally)
//
// Flags:
//   --silent   suppress success banner (used by postinstall to keep npm quiet)
//   --target=  override install directory (default: ~/.claude/skills/)
//   --force    overwrite an existing skill of the same name

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

function arg(name, fallback = undefined) {
  const flag = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!flag) return fallback;
  if (flag === `--${name}`) return true;
  return flag.slice(`--${name}=`.length);
}

function log(...args) {
  if (!arg("silent")) console.log(...args);
}

function fail(msg, code = 1) {
  console.error(`coffer-cost-review: ${msg}`);
  process.exit(code);
}

function main() {
  const target = arg("target") || path.join(os.homedir(), ".claude", "skills");
  const dest = path.join(target, "coffer-cost-review");
  const force = arg("force") === true;

  const skillSrc = path.join(__dirname, "skill");
  if (!fs.existsSync(skillSrc)) {
    fail(`bundled skill not found at ${skillSrc}`);
  }

  if (fs.existsSync(dest) && !force) {
    log(`Skill already installed at ${dest}`);
    log(`Re-install with: coffer-cost-review --force`);
    return;
  }

  fs.mkdirSync(target, { recursive: true });
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });

  // Copy every file in skill/ into the destination.
  const copied = [];
  for (const name of fs.readdirSync(skillSrc)) {
    const from = path.join(skillSrc, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isFile()) {
      fs.copyFileSync(from, to);
      copied.push(name);
    }
  }

  log("");
  log(`  ✓ Installed Coffer cost-review skill to ${dest}`);
  log(`    Files: ${copied.join(", ")}`);
  log("");
  log("  Open Claude Code and ask:  review my LLM costs");
  log("");
  log("  Live runtime cost tracking (the part static review can't do):");
  log("    https://cofferwise.com");
  log("");
}

main();
