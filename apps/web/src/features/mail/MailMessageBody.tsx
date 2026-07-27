"use client";

import type { MailMessageDetail } from "@/features/mail/mail.types";

export function MailMessageBody({ message }: { message: MailMessageDetail }) {
  if (message.html) {
    const document = `<!doctype html><html><head><meta name="color-scheme" content="dark"><style>body{margin:0;padding:16px;background:#0b0c10;color:#d6d7db;font:14px/1.65 system-ui,sans-serif}a{color:#67e8f9}img{max-width:100%;height:auto}</style></head><body>${message.html}</body></html>`;
    return (
      <iframe
        className="h-80 w-full border-0 bg-[#0b0c10]"
        sandbox=""
        srcDoc={document}
        title={`Email: ${message.subject}`}
      />
    );
  }
  return (
    <div className="whitespace-pre-wrap p-4 text-sm leading-6 text-white/70">
      {message.text || "This message has no readable body."}
    </div>
  );
}
