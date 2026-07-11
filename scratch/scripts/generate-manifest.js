#!/usr/bin/env node
/**
 * generate-manifest.js
 *
 * GitHub Pages is static hosting -- there is no server-side code that can list
 * a directory's contents at request time. This script solves that by walking
 * the repo root ahead of time (skipping the site's own files -- index.html,
 * css/, js/, etc., see EXCLUDE_FROM_ROOT below) and writing out
 * `data/manifest.json`, which the front-end fetches instead of asking the
 * server for a live listing.
 *
 * Usage:
 *   node scripts/generate-manifest.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT, "data", "manifest.json");

const EXCLUDE_FROM_ROOT = new Set([
  "index.html",
  "style.css",
  "main.js",
  "data",
  "scripts",,
  ".github",
  ".git",
  ".nojekyll",
]);

const TYPE_BY_EXT = {
  ".sb": "scratch",
  ".sb2": "scratch",
  ".sb3": "scratch",
  ".png": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".gif": "image",
  ".webp": "image",
  ".pdf": "pdf",
  ".txt": "text",
  ".md": "text",
  ".html": "html",
  ".mp4": "video",
  ".webm": "video",
  ".wmv": "video",
};

function classify(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return TYPE_BY_EXT[ext] || "file";
}

function walk(dir, isRoot = false) {
  const items = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((item) => !item.name.startsWith("."))
    .filter((item) => !(isRoot && EXCLUDE_FROM_ROOT.has(item.name)))
    .sort((a, b) => a.name.localeCompare(b.name));

  const entries = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relPath = path.relative(ROOT, fullPath).split(path.sep).join("/");
    const stat = fs.statSync(fullPath);

    if (item.isDirectory()) {
      entries.push({
        name: item.name,
        type: "folder",
        entries: walk(fullPath),
      });
    } else {
      entries.push({
        name: item.name,
        type: classify(item.name),
        file: relPath,
        date: stat.mtime.toISOString().slice(0, 10),
      });
    }
  }

  return entries;
}

function main() {
  const manifest = {
    generated: new Date().toISOString(),
    root: ".",
    entries: walk(ROOT, true),
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${OUTPUT_FILE} with ${manifest.entries.length} top-level entries.`);
}

main();
