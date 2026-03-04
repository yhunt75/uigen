#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const prismaCli = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");
const nodeMajor = Number(process.versions.node.split(".")[0]);

function run(args) {
  return spawnSync(process.execPath, args, {
    stdio: "inherit",
  });
}

if (nodeMajor < 18) {
  const legacy = run([
    "--experimental-wasm-reftypes",
    prismaCli,
    "generate",
  ]);

  if (legacy.status === 0) {
    process.exit(0);
  }
}

const modern = run([prismaCli, "generate"]);
process.exit(modern.status ?? 1);
