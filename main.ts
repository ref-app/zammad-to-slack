#!/usr/bin/env ts-node-script
import * as express from "express"

const app = express()

app.use(express.json());

app.post("/zammad",(req,res)=>{
    console.log(req.body);
    res.status(200);
    res.end();
})

app.listen(3001);