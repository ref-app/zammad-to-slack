#!/usr/bin/env -S node --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types
import axios from "axios";
import auth from "basic-auth";
import fastify, { type FastifyReply } from "fastify";
import fastifyRawBody from "fastify-raw-body";
import Mustache from "mustache";
import { createHmac } from "node:crypto";
import type FromSchema from "./json-schema-to-ts";

const app = fastify();

const slackWebhook = process.env["SLACK_WEBHOOK"];
const hubSecret = process.env["SHA1_HUB_SECRET"];
const basicUser = process.env["BASIC_USERNAME"];
const basicPassword = process.env["BASIC_PASSWORD"];

const format =
  process.env["MESSAGE_FORMAT"] ??
  "Zammad ticket {{ticket.id}}, state {{ticket.state}} from a user at {{customerDomain}}";

app.register(fastifyRawBody);

app.get("/", (_req, res) => {
  res.code(200).send("Nothing to see here, move on");
});

const sendToSlack = async (message: string) => {
  try {
    if (slackWebhook) {
      await axios.post(slackWebhook, { text: message });
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

const end = (res: FastifyReply): void => {
  res.status(200);
};

const body = {
  type: "object",
  properties: {
    article: {
      type: "object",
      properties: { sender: { type: "string" }, reply_to: { type: "string" } },
    },
    ticket: {
      type: "object",
      properties: {
        customer: { type: "object", properties: { email: { type: "string" } } },
      },
    },
  },
  required: ["article"],
} as const;
type Body = FromSchema<typeof body>;

app.post<{ Body: Body }>(
  "/zammad",
  { schema: { body }, attachValidation: true },
  async (req, res) => {
    if (req.validationError !== undefined) {
      console.error(req.validationError);
      return end(res);
    }
    if (hubSecret) {
      if (req.rawBody === undefined) {
        return end(res);
      }
      const hmac = createHmac("sha1", hubSecret);
      hmac.update(req.rawBody);
      const token = `sha1=${hmac.digest("hex")}`;
      if (req.headers["x-hub-signature"] !== token) {
        return end(res);
      }
    }
    if (basicUser && basicPassword) {
      const credentials = auth(req);
      if (
        credentials?.name !== basicUser ||
        credentials.pass !== basicPassword
      ) {
        return end(res);
      }
    }
    const body = req.body;
    // Only send triggers to Slack if the action is not taken by an Agent.
    if (body.article.sender !== "Agent") {
      const customerDomain = getSenderDomain(
        body.article.reply_to,
        body.ticket?.customer?.email,
      );
      const message = Mustache.render(format, { ...body, customerDomain });
      await sendToSlack(message);
    }
    return end(res);
  },
);
const PORT = 8000;

console.info(`Starting web server on port ${PORT}`);

app.listen({ port: PORT });
