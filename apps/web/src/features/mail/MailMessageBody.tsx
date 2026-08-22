"use client";

import { useRef, useState } from "react";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import type { MailMessageDetail } from "@/features/mail/mail.types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MailMessageBody({ message }: { message: MailMessageDetail }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(300);

  const handleIframeLoad = () => {
    try {
      if (iframeRef.current?.contentWindow?.document?.body) {
        const height =
          iframeRef.current.contentWindow.document.body.scrollHeight ||
          iframeRef.current.contentWindow.document.documentElement.scrollHeight;
        if (height > 50) {
          setIframeHeight(height + 32);
        }
      }
    } catch {
      // Cross-origin restriction if applicable
    }
  };

  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <div className="space-y-4">
      {message.html ? (
        <iframe
          ref={iframeRef}
          onLoad={handleIframeLoad}
          className="w-full border-0 bg-transparent"
          style={{ height: `${iframeHeight}px`, minHeight: "200px" }}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          srcDoc={`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><style>body{margin:0;padding:16px;background:transparent;color:#030303;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6}a{color:#A855F7}img{max-width:100%;height:auto}table{border-collapse:collapse;max-width:100%}@media (prefers-color-scheme: dark){body{color:#e2e8f0}a{color:#c084fc}}</style></head><body>${message.html}</body></html>`}
          title={`Email: ${message.subject}`}
        />
      ) : message.text ? (
        <div className="whitespace-pre-wrap p-4 text-sm leading-6 text-black/80 dark:text-white/80">
          {message.text}
        </div>
      ) : (
        <div className="p-4 text-sm italic text-black/50 dark:text-white/50">
          This message has no readable body.
        </div>
      )}

      {hasAttachments && (
        <div className="border-t border-black/10 p-4 dark:border-white/10">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60">
            Attachments ({message.attachments?.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {message.attachments?.map((att) => {
              const isImage = att.contentType.startsWith("image/");
              const downloadUrl = att.contentBase64
                ? `data:${att.contentType};base64,${att.contentBase64}`
                : undefined;

              return (
                <div
                  key={att.id || att.filename}
                  className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                >
                  {isImage ? (
                    <ImageIcon className="h-4 w-4 text-purple-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-purple-500" />
                  )}
                  <div className="max-w-[180px] truncate font-medium text-black dark:text-white">
                    {att.filename}
                  </div>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    ({formatFileSize(att.size)})
                  </span>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download={att.filename}
                      className="ml-1 text-black/60 hover:text-purple-600 dark:text-white/60 dark:hover:text-purple-400"
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
