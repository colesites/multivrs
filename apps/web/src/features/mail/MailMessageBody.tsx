"use client";

import {
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MailMessageDetail } from "@/features/mail/mail.types";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type EmailViewTab = "preview" | "text" | "html" | "raw";

// Real emails from Gmail/clients are authored for a light canvas.
// Using explicit high-contrast dark text (#111827) on a clean white canvas
// guarantees readability and matches Resend's email preview canvas.
const EMAIL_STYLES = `
  html, body {
    margin: 0;
    padding: 0;
    background-color: #ffffff;
    color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14.5px;
    line-height: 1.6;
    word-break: break-word;
  }
  a {
    color: #2563eb;
    text-decoration: underline;
  }
  img {
    max-width: 100%;
  }
  img:not([height]) {
    height: auto;
  }
  table {
    border-collapse: collapse;
    max-width: 100%;
  }
  blockquote, .gmail_quote {
    color: #4b5563;
    border-left: 2px solid #e5e7eb;
    padding-left: 12px;
    margin: 12px 0;
  }
`;

// Automatically resolves inline CID images, protocol-relative URLs,
// and lazy-loading image sources across email providers.
function resolveEmailHtml(
  html?: string,
  attachments?: MailMessageDetail["attachments"],
): string {
  if (!html) return "";
  let content = html;

  // 1. Resolve embedded CID inline attachments (e.g. cid:image001.png or cid:<image001.png>)
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      if (att.contentBase64) {
        const cleanCid = att.contentId?.replace(/[<>]/g, "").trim();
        const dataUri = `data:${att.contentType};base64,${att.contentBase64}`;
        if (cleanCid) {
          content = content.replace(
            new RegExp(`cid:<?${cleanCid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}>?`, "gi"),
            dataUri,
          );
        }
        if (att.filename) {
          content = content.replace(
            new RegExp(`cid:<?${att.filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}>?`, "gi"),
            dataUri,
          );
        }
      }
    }
  }

  // 2. Normalize protocol-relative URLs (e.g. src="//cdn.example.com/...")
  content = content.replace(/src=["']\/\/([^"']+)["']/gi, 'src="https://$1"');

  // 3. Normalize lazy-loaded data-src images:
  // If an img tag has data-src, data-original, data-url, or data-lazy-src:
  // Ensure its src points to the real image URL!
  content = content.replace(/<img\b([^>]*)>/gi, (_match, attrs) => {
    let updatedAttrs = attrs;

    // Check for lazy source attributes
    const lazySrcMatch = attrs.match(
      /\b(?:data-src|data-original|data-url|data-lazy-src)=["']([^"']+)["']/i,
    );
    if (lazySrcMatch?.[1]) {
      const realSrc = lazySrcMatch[1];
      const srcMatch = attrs.match(/\bsrc=["']([^"']*)["']/i);
      const currentSrc = srcMatch ? srcMatch[1] : "";
      const isSpacer =
        !currentSrc ||
        currentSrc.startsWith("data:image/gif") ||
        currentSrc.startsWith("data:image/svg") ||
        currentSrc.includes("spacer") ||
        currentSrc.includes("blank.gif");

      if (isSpacer) {
        if (srcMatch) {
          updatedAttrs = updatedAttrs.replace(
            /\bsrc=["'][^"']*["']/i,
            `src="${realSrc}"`,
          );
        } else {
          updatedAttrs = ` src="${realSrc}" ${updatedAttrs}`;
        }
      }
    }

    // Force eager loading so iframe doesn't defer or cancel image downloads
    updatedAttrs = updatedAttrs.replace(
      /\bloading=["']lazy["']/gi,
      'loading="eager"',
    );

    return `<img${updatedAttrs}>`;
  });

  return content;
}

export function MailMessageBody({ message }: { message: MailMessageDetail }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(300);
  const [activeTab, setActiveTab] = useState<EmailViewTab>(
    message.html ? "preview" : "text",
  );
  const [copied, setCopied] = useState(false);

  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.body) {
        const updateHeight = () => {
          const measured = Math.max(
            doc.body.scrollHeight || 0,
            doc.documentElement.scrollHeight || 0,
            doc.body.offsetHeight || 0,
          );
          if (measured > 40) {
            setIframeHeight((prev) =>
              Math.abs(prev - (measured + 24)) > 4 ? measured + 24 : prev,
            );
          }
        };

        updateHeight();

        // Listen for image and font loads to dynamically adjust height as media streams in
        const images = doc.querySelectorAll("img");
        images.forEach((img) => {
          if (!img.complete) {
            img.addEventListener("load", updateHeight, { once: true });
            img.addEventListener("error", updateHeight, { once: true });
          }
        });

        // Also check if document height expands
        if (window.ResizeObserver) {
          const ro = new ResizeObserver(updateHeight);
          ro.observe(doc.body);
        }

        setTimeout(updateHeight, 300);
        setTimeout(updateHeight, 1000);
      }
    } catch {
      // Fallback
    }
  };

  const hasAttachments = message.attachments && message.attachments.length > 0;

  const resolvedHtml = useMemo(
    () => resolveEmailHtml(message.html, message.attachments),
    [message.html, message.attachments],
  );

  const srcDoc = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><base target="_blank"><style>${EMAIL_STYLES}</style></head><body>${resolvedHtml || message.text}</body></html>`,
    [resolvedHtml, message.text],
  );

  const rawPayload = useMemo(() => {
    return [
      `From: ${message.fromName ? `${message.fromName} ` : ""}<${message.fromAddress}>`,
      `To: ${message.to.join(", ")}`,
      message.cc && message.cc.length > 0
        ? `Cc: ${message.cc.join(", ")}`
        : null,
      `Subject: ${message.subject}`,
      `Date: ${new Date(message.createdAt).toUTCString()}`,
      `Message-ID: ${message.id}`,
      `Folder: ${message.folder}`,
      `Status: ${message.status}`,
      "",
      "--- Body ---",
      message.text || message.html || "(No content)",
    ]
      .filter(Boolean)
      .join("\n");
  }, [message]);

  const handleCopy = async () => {
    try {
      const content =
        activeTab === "html"
          ? message.html || ""
          : activeTab === "raw"
            ? rawPayload
            : message.text || message.html || "";
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="w-full min-w-0">
      {/* Resend-style Email Viewer Card */}
      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/2 dark:bg-[#0c0d10] shadow-xs">
        {/* Header Tabs Bar */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 px-3 py-2 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer",
                activeTab === "preview"
                  ? "bg-black/10 dark:bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              )}
            >
              Preview
            </button>
            {message.text && (
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer",
                  activeTab === "text"
                    ? "bg-black/10 dark:bg-white/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                )}
              >
                Plain Text
              </button>
            )}
            {message.html && (
              <button
                type="button"
                onClick={() => setActiveTab("html")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer",
                  activeTab === "html"
                    ? "bg-black/10 dark:bg-white/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                )}
              >
                HTML
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("raw")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer",
                activeTab === "raw"
                  ? "bg-black/10 dark:bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              )}
            >
              Raw
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            title="Copy content"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-[11px] text-emerald-500 font-mono">
                  Copied
                </span>
              </>
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>

        {/* Tab 1: Preview Canvas — Crisp white paper with solid dark text matching Resend */}
        {activeTab === "preview" && (
          <div className="bg-white p-6 sm:p-8 text-neutral-900 rounded-b-xl min-h-[160px]">
            {message.html ? (
              <iframe
                ref={iframeRef}
                onLoad={handleIframeLoad}
                className="w-full border-0 bg-white block"
                style={{
                  height: `${iframeHeight}px`,
                  minHeight: "160px",
                  overflow: "hidden",
                }}
                scrolling="no"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                srcDoc={srcDoc}
                title={`Email: ${message.subject}`}
              />
            ) : message.text ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-900 font-sans">
                {message.text}
              </div>
            ) : (
              <div className="text-sm italic text-neutral-500">
                This message has no readable body content.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Plain Text */}
        {activeTab === "text" && (
          <div className="p-6 text-sm whitespace-pre-wrap font-sans leading-relaxed text-foreground/90 bg-background dark:bg-[#07080a] min-h-[160px]">
            {message.text || "No plain text content available."}
          </div>
        )}

        {/* Tab 3: HTML Source */}
        {activeTab === "html" && (
          <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] overflow-y-auto bg-background dark:bg-[#07080a] text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap select-text min-h-[160px]">
            {message.html || "No HTML source available."}
          </div>
        )}

        {/* Tab 4: Raw Headers & Payload */}
        {activeTab === "raw" && (
          <div className="p-4 sm:p-6 overflow-x-auto max-h-[600px] overflow-y-auto bg-background dark:bg-[#07080a] text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre select-text min-h-[160px]">
            {rawPayload}
          </div>
        )}
      </div>

      {hasAttachments && (
        <div className="mt-4 border-t border-black/8 dark:border-white/8 pt-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">
            <span>Attachments</span>
            <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono">
              {message.attachments?.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {message.attachments?.map((att) => {
              const isImage = att.contentType.startsWith("image/");
              const downloadUrl = att.contentBase64
                ? `data:${att.contentType};base64,${att.contentBase64}`
                : undefined;

              return (
                <div
                  key={att.id || att.filename}
                  className="group flex items-center gap-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/3 dark:bg-white/4 px-3.5 py-2.5 text-xs transition hover:bg-black/6 dark:hover:bg-white/8"
                >
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    {isImage ? (
                      <ImageIcon className="size-3.5" />
                    ) : (
                      <FileText className="size-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 max-w-[200px]">
                    <div className="truncate font-medium text-black/90 dark:text-white/90">
                      {att.filename}
                    </div>
                    <div className="text-[10px] text-black/45 dark:text-white/45 font-mono">
                      {formatFileSize(att.size)}
                    </div>
                  </div>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download={att.filename}
                      className="ml-1 inline-flex size-7 items-center justify-center rounded-lg text-black/50 hover:bg-black/10 hover:text-black dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white transition"
                      title="Download file"
                    >
                      <Download className="size-3.5" />
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
