#!/usr/bin/env ts-node-script
import * as express from "express"

const app = express()

const slackToken = process.env["SLACK_TOKEN"];

app.use(express.json());

app.post("/zammad",(req,res)=>{
    console.log(req.body);
    res.status(200);
    res.end();
})

app.listen(3001);