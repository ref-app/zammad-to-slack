#!/usr/bin/env -S node -r ts-node/register
import axios from "axios";
import auth from "basic-auth";
import express, { Response } from "express";
import get from "lodash.get";
import isPlainObject from "lodash.isplainobject";
import Mustache from "mustache";
import { createHmac } from "node:crypto";

const app = express();

const slackWebhook = process.env["SLACK_WEBHOOK"];
const hubSecret = process.env["SHA1_HUB_SECRET"];
const basicUser = process.env["BASIC_USERNAME"];
const basicPassword = process.env["BASIC_PASSWORD"];

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
      await axios.post(slackWebhook, { text: message });
    } else {
      console.log({ sendToslack: message });
    }
  } catch (e) {
    console.error(e);
  }
};

const getSenderDomain = (
  replyTo: string | undefined,
  customerEmail: string | undefined,
): string => {
  const replyToEmail = replyTo ? /<([^>]+)>/i.exec(replyTo)?.[1] : undefined;
  const domain = (replyToEmail ?? customerEmail)?.split("@")?.[1] ?? "??";
  return domain;
};

const end = (res: Response): void => {
  res.status(200);
  res.end();
};

app.post("/zammad", async (req, res) => {
  if (!isPlainObject(req.body)) {
    return end(res);
  }
  if (hubSecret) {
    const hmac = createHmac("sha1", hubSecret);
    hmac.update(req.rawBody);
    const token = `sha1=${hmac.digest("hex")}`;
    if (req.get("x-hub-signature") !== token) {
      return end(res);
    }
  }
  if (basicUser && basicPassword) {
    const credentials = auth(req);
    if (credentials?.name !== basicUser || credentials.pass !== basicPassword) {
      return end(res);
    }
  }
  const body = req.body;
  // Only send triggers to Slack if the action is not taken by an Agent.
  if (get(body, "article.sender") !== "Agent") {
    const customerDomain = getSenderDomain(
      get(body, "article.reply_to"),
      get(body, "ticket.customer.email"),
    );
    const message = Mustache.render(format, { ...body, customerDomain });
    await sendToSlack(message);
  }
  return end(res);
});
const PORT = 8000;

console.info(`Starting web server on port ${PORT}`);

app.listen(PORT);
