#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

function bumpPatch(version) {
  const [major, minor, patch] = version.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const nextVersion = bumpPatch(packageJson.version);
packageJson.version = nextVersion;
writeFileSync("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
manifest.version = nextVersion;
writeFileSync("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);

const versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[nextVersion] = manifest.minAppVersion;
writeFileSync("versions.json", `${JSON.stringify(versions, null, 2)}\n`);

console.log(nextVersion);
