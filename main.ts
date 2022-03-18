#!/usr/bin/env ts-node
import * as express from "express";
import * as _ from "lodash";
import * as axios from "axios";
import Mustache from "mustache";

const app = express.default();

const slackWebhook = process.env["SLACK_WEBHOOK"];

const format =
  process.env["MESSAGE_FORMAT"] ??
  "Zammad ticket {{id}}, state {{state}} from a user at {{customerDomain}}";

app.use(express.json());

app.get("/", (_req, res) => {
  res.write("Nothing to see here, move on");
  res.status(200);
  res.end();
});

const sendToSlack = async (message: string) => {
  try {
    if (slackWebhook) {
      axios.default.post(slackWebhook, { text: message });
    }
  } catch (e) {
    console.error(e);
  }
};

app.post("/zammad", async (req, res) => {
  const ticket = req.body.ticket ?? {};
  console.log(ticket);
  const customerDomain =
    _.get(ticket, "customer.email")?.split("@")?.[1] ?? "??";
  const message = Mustache.render(format, { ...ticket, customerDomain });
  await sendToSlack(message);
  res.status(200);
  res.end();
});
const PORT = 8000;

console.info(`Starting web server on port ${PORT}`);

app.listen(PORT);
