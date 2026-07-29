"use client";

import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";

export function MailAttachmentPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function choose(next: FileList | null) {
    const selected = Array.from(next ?? []).slice(0, 5);
    setFiles(selected);
  }

  function remove(index: number) {
    const next = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(next);
    if (inputRef.current) {
      const transfer = new DataTransfer();
      next.forEach((file) => {
        transfer.items.add(file);
      });
      inputRef.current.files = transfer.files;
    }
  }

  return (
    <div>
      <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-2.5 text-xs text-white/55 hover:bg-white/[0.06] hover:text-white">
        <Paperclip className="size-3.5" /> Attach files
        <input
          className="sr-only"
          multiple
          name="attachments"
          onChange={(event) => choose(event.target.files)}
          ref={inputRef}
          type="file"
        />
      </label>
      {files.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <span
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-white/60"
              key={`${file.name}-${file.lastModified}`}
            >
              <span className="max-w-48 truncate">{file.name}</span>
              <button
                aria-label={`Remove ${file.name}`}
                onClick={() => remove(index)}
                type="button"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
