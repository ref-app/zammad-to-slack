#!/usr/bin/env -S yarn exec -s ts-node
import * as axios from "axios";
import * as express from "express";
import get from "lodash.get";
import Mustache from "mustache";

const app = express.default();

const slackWebhook = process.env["SLACK_WEBHOOK"];

const format =
  process.env["MESSAGE_FORMAT"] ??
  "Zammad ticket {{ticket.id}}, state {{ticket.state}} from a user at {{customerDomain}}";

app.use(express.json());

app.get("/", (_req, res) => {
  res.write("Nothing to see here, move on");
  res.status(200);
  res.end();
});

const sendToSlack = async (message: string) => {
  try {
    if (slackWebhook) {
      await axios.default.post(slackWebhook, { text: message });
    }
  } catch (e) {
    console.error(e);
  }
};

const getSenderDomain = (
  replyTo: string | undefined,
  customerEmail: string | undefined
): string => {
  const replyToEmail = replyTo ? /<([^>]+)>/i.exec(replyTo)?.[1] : undefined;
  const domain = (replyToEmail ?? customerEmail)?.split("@")?.[1] ?? "??";
  return domain;
};

app.post("/zammad", async (req, res) => {
  const body = req.body ?? {};
  // Only send triggers to Slack if the action is not taken by an Agent.
  if (get(body, "article.sender") !== "Agent") {
    const customerDomain = getSenderDomain(
      get(body, "article.reply_to"),
      get(body, "ticket.customer.email")
    );
    const message = Mustache.render(format, { ...body, customerDomain });
    await sendToSlack(message);
  }
  res.status(200);
  res.end();
});
const PORT = 8000;

console.info(`Starting web server on port ${PORT}`);

app.listen(PORT);
