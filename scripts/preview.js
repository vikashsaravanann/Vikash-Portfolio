"use strict";
const express = require("express");
const path = require("node:path");
const app = express();
const port = Number(process.env.PORT || 5500);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid PORT");
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("X-Content-Type-Options", "nosniff");
  next();
});
app.use(
  express.static(path.resolve(__dirname, "../dist"), {
    extensions: ["html"],
    dotfiles: "deny",
  }),
);
app.use((_req, res) => res.status(404).type("text").send("Not found"));
app.listen(port, "127.0.0.1", () =>
  console.log(`Portfolio preview: http://127.0.0.1:${port}`),
);
