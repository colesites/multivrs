/**
 * Code samples for the /emails "Integrate" section. Every sample calls the
 * real endpoint (POST /api/v1/mail/send with a Bearer mail key), which
 * answers `{ id, status }` on success and `{ error: { code, message } }` on
 * failure.
 */

export const SEND_URL = "https://multivrs.space/api/v1/mail/send";

export type Variant = { id: string; label: string; file: string; code: string };
export type Language = {
  id: string;
  label: string;
  glyph: string;
  variants: Variant[];
};

/** The shared fetch call, indented for wherever it is embedded. */
function fetchCall(indent: string, env = "process.env"): string {
  return [
    `const response = await fetch("${SEND_URL}", {`,
    `  method: "POST",`,
    `  headers: {`,
    `    Authorization: \`Bearer \${${env}.MULTIVRS_MAIL_KEY}\`,`,
    `    "Content-Type": "application/json",`,
    `  },`,
    `  body: JSON.stringify({`,
    `    mailboxId: ${env}.MULTIVRS_MAILBOX_ID,`,
    `    to: ["ada@example.com"],`,
    `    subject: "Hello World",`,
    `    html: "<strong>It works!</strong>",`,
    `  }),`,
    `});`,
  ]
    .map((line) => indent + line)
    .join("\n");
}

const node = `${fetchCall("")}

const { id, error } = await response.json();

if (error) {
  throw new Error(error.message);
}

console.log(id);`;

const nextjs = `// app/api/send/route.ts
export async function POST() {
${fetchCall("  ")}

  return Response.json(await response.json(), {
    status: response.status,
  });
}`;

const bun = `${fetchCall("", "Bun.env")}

const { id, error } = await response.json();

console.log(error ?? id);`;

const hono = `import { Hono } from "hono";

const app = new Hono();

app.post("/send", async (c) => {
${fetchCall("  ")}

  return c.json(await response.json());
});

export default app;`;

const express = `import express from "express";

const app = express();

app.post("/send", async (_req, res) => {
${fetchCall("  ")}

  res.status(response.status).json(await response.json());
});

app.listen(3000);`;

const python = `import os
import requests

response = requests.post(
    "${SEND_URL}",
    headers={"Authorization": f"Bearer {os.environ['MULTIVRS_MAIL_KEY']}"},
    json={
        "mailboxId": os.environ["MULTIVRS_MAILBOX_ID"],
        "to": ["ada@example.com"],
        "subject": "Hello World",
        "html": "<strong>It works!</strong>",
    },
)

print(response.json())`;

const go = `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
  "os"
)

func main() {
  body, _ := json.Marshal(map[string]any{
    "mailboxId": os.Getenv("MULTIVRS_MAILBOX_ID"),
    "to":        []string{"ada@example.com"},
    "subject":   "Hello World",
    "html":      "<strong>It works!</strong>",
  })

  req, _ := http.NewRequest("POST", "${SEND_URL}", bytes.NewReader(body))
  req.Header.Set("Authorization", "Bearer "+os.Getenv("MULTIVRS_MAIL_KEY"))
  req.Header.Set("Content-Type", "application/json")

  res, err := http.DefaultClient.Do(req)
  if err != nil {
    panic(err)
  }
  defer res.Body.Close()

  fmt.Println(res.Status)
}`;

const rust = `use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let key = std::env::var("MULTIVRS_MAIL_KEY").unwrap();
    let mailbox = std::env::var("MULTIVRS_MAILBOX_ID").unwrap();

    let res = reqwest::Client::new()
        .post("${SEND_URL}")
        .bearer_auth(key)
        .json(&json!({
            "mailboxId": mailbox,
            "to": ["ada@example.com"],
            "subject": "Hello World",
            "html": "<strong>It works!</strong>"
        }))
        .send()
        .await?;

    println!("{}", res.text().await?);
    Ok(())
}`;

const php = `<?php

$ch = curl_init("${SEND_URL}");

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer " . getenv("MULTIVRS_MAIL_KEY"),
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "mailboxId" => getenv("MULTIVRS_MAILBOX_ID"),
        "to" => ["ada@example.com"],
        "subject" => "Hello World",
        "html" => "<strong>It works!</strong>",
    ]),
]);

echo curl_exec($ch);`;

const ruby = `require "net/http"
require "json"

uri = URI("${SEND_URL}")

response = Net::HTTP.post(
  uri,
  {
    mailboxId: ENV.fetch("MULTIVRS_MAILBOX_ID"),
    to: ["ada@example.com"],
    subject: "Hello World",
    html: "<strong>It works!</strong>"
  }.to_json,
  "Authorization" => "Bearer #{ENV.fetch('MULTIVRS_MAIL_KEY')}",
  "Content-Type" => "application/json"
)

puts response.body`;

const curl = `curl -X POST ${SEND_URL} \\
  -H "Authorization: Bearer $MULTIVRS_MAIL_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mailboxId": "YOUR_MAILBOX_ID",
    "to": ["ada@example.com"],
    "subject": "Hello World",
    "html": "<strong>It works!</strong>"
  }'`;

const smtp = `import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.MULTIVRS_SMTP_HOST,
  port: 587,
  secure: false, // upgraded with STARTTLS
  auth: {
    user: process.env.MULTIVRS_SMTP_USER, // mlv_<credential id>
    pass: process.env.MULTIVRS_SMTP_KEY,
  },
});

const info = await transport.sendMail({
  from: "Acme <hello@acme.dev>",
  to: "ada@example.com",
  subject: "Hello World",
  html: "<strong>It works!</strong>",
});

console.log(info.messageId);`;

export const LANGUAGES: Language[] = [
  {
    id: "node",
    label: "Node.js",
    glyph: "JS",
    variants: [
      { id: "node", label: "Node.js", file: "send.ts", code: node },
      { id: "nextjs", label: "Next.js", file: "route.ts", code: nextjs },
      { id: "bun", label: "Bun", file: "send.ts", code: bun },
      { id: "hono", label: "Hono", file: "index.ts", code: hono },
      { id: "express", label: "Express", file: "server.ts", code: express },
    ],
  },
  {
    id: "python",
    label: "Python",
    glyph: "Py",
    variants: [
      { id: "requests", label: "requests", file: "send.py", code: python },
    ],
  },
  {
    id: "go",
    label: "Go",
    glyph: "GO",
    variants: [{ id: "nethttp", label: "net/http", file: "main.go", code: go }],
  },
  {
    id: "rust",
    label: "Rust",
    glyph: "RS",
    variants: [
      { id: "reqwest", label: "reqwest", file: "main.rs", code: rust },
    ],
  },
  {
    id: "php",
    label: "PHP",
    glyph: "php",
    variants: [
      { id: "curl-ext", label: "cURL extension", file: "send.php", code: php },
    ],
  },
  {
    id: "ruby",
    label: "Ruby",
    glyph: "rb",
    variants: [
      { id: "nethttp-rb", label: "Net::HTTP", file: "send.rb", code: ruby },
    ],
  },
  {
    id: "curl",
    label: "cURL",
    glyph: ">_",
    variants: [{ id: "shell", label: "Shell", file: "terminal", code: curl }],
  },
  {
    id: "smtp",
    label: "SMTP",
    glyph: "SMTP",
    variants: [
      { id: "nodemailer", label: "Nodemailer", file: "smtp.ts", code: smtp },
    ],
  },
];

/* ─── Tiny syntax highlighter (strings, comments, keywords) ─── */

export type Token = {
  text: string;
  kind: "plain" | "string" | "comment" | "keyword";
};

const TOKEN_RE =
  /(\/\/.*$|#(?![[{]).*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|from|export|default|const|let|mut|await|async|function|return|if|throw|new|package|func|use|fn|require|defer|puts|print|echo)\b)/g;

export function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN_RE)) {
    const text = match[0];
    const start = match.index ?? 0;
    if (start > last)
      tokens.push({ text: line.slice(last, start), kind: "plain" });
    const first = text[0];
    const kind: Token["kind"] =
      text.startsWith("//") || first === "#"
        ? "comment"
        : first === '"' || first === "'" || first === "`"
          ? "string"
          : "keyword";
    tokens.push({ text, kind });
    last = start + text.length;
  }
  if (last < line.length)
    tokens.push({ text: line.slice(last), kind: "plain" });
  return tokens;
}
