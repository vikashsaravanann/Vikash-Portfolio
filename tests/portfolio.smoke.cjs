"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist");
const pages = [
  "index.html",
  "voiceshield.html",
  "logic-voice.html",
  "business-ai.html",
];
test("all internal page links, anchors and asset references resolve in the publish output", () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.equal(
      (html.match(/<h1[\s>]/g) || []).length,
      1,
      `${page}: one primary heading`,
    );
    for (const [, reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:|data:)/.test(reference)) continue;
      const [file, hash] = reference.split("#");
      const target = path.join(root, file || page);
      assert.ok(fs.existsSync(target), `${page}: missing ${reference}`);
      if (hash)
        assert.ok(
          fs.readFileSync(target, "utf8").includes(`id="${hash}"`),
          `${page}: missing anchor ${reference}`,
        );
    }
    assert.ok(html.includes("createwithvikash@gmail.com"));
    assert.ok(!html.includes("vikash07052008@gmail.com"));
    assert.ok(
      !html.includes("github.com/vikashsaravanann/logic-voice"),
      "Do not link visitors to the private repository",
    );
  }
});
test("current résumé is a PDF and the old download path serves identical bytes", () => {
  const current = fs.readFileSync(
    path.join(root, "assets/docs/Vikash_Saravanan_Resume.pdf"),
  );
  assert.equal(current.subarray(0, 5).toString(), "%PDF-");
  assert.deepEqual(
    current,
    fs.readFileSync(path.join(root, "assets/Vikash_Saravanan_Resume.pdf")),
  );
});
test("only intended public content is included in the deployable build", () => {
  for (const name of [
    ".env",
    ".git",
    "api",
    "lib",
    "server.js",
    "package.json",
    "assets/family",
    "assets/friends",
    "assets/childhood",
    "assets/certs",
  ])
    assert.equal(fs.existsSync(path.join(root, name)), false, name);
});
test("offline core asset list resolves without caching unavailable files", () => {
  const worker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  const list = worker.match(/const CORE_URLS = \[([\s\S]*?)\]/)[1];
  for (const [, file] of list.matchAll(/"([^"]+)"/g))
    assert.ok(fs.existsSync(path.join(root, file)), file);
});
