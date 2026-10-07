"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
// Explicit public file list keeps legacy demos and personal galleries out of the deployment.
const files = [
  "index.html",
  "voiceshield.html",
  "logic-voice.html",
  "business-ai.html",
  "css/portfolio.css",
  "js/portfolio.js",
  "js/register-sw.js",
  "sw.js",
  "manifest.json",
  "robots.txt",
  "sitemap.xml",
  "assets/fonts/dm-sans-latin.woff2",
  "assets/fonts/instrument-serif-italic.woff2",
  "assets/fonts/DM-Sans-LICENSE.txt",
  "assets/fonts/Instrument-Serif-LICENSE.txt",
  "assets/profile/profile11.webp",
  "assets/profile/profile2.webp",
  "assets/icons/monogram.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/og-preview.png",
  "assets/landing-preview-v2.jpg",
  "assets/docs/Vikash_Saravanan_Resume.pdf",
];
fs.rmSync(output, { recursive: true, force: true });
for (const file of files) {
  const destination = path.join(output, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
}
// Keep old résumé links working, with the same newly supplied PDF.
fs.copyFileSync(
  path.join(output, "assets/docs/Vikash_Saravanan_Resume.pdf"),
  path.join(output, "assets/Vikash_Saravanan_Resume.pdf"),
);
console.log(`Built ${files.length + 1} public files into dist/`);
