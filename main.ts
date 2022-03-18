#!/usr/bin/env ts-node
import * as express from "express";

const app = express.default();

const slackToken = process.env["SLACK_TOKEN"];

app.use(express.json());

app.get("/", (_req, res) => {
  res.write("Nothing to see here, move on");
  res.status(200);
  res.end();
});

app.post("/zammad", (req, res) => {
  console.log(req.body);
  res.status(200);
  res.end();
});
const PORT = 8000;

console.info(`Starting web server on port ${PORT}`);

app.listen(PORT);
