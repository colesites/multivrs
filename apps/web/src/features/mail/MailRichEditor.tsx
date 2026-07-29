"use client";

import { Bold, ImagePlus, Italic, Link2, Underline } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

function editorCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function sanitizedEditorDocument(value: string): Document {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  for (const unsafe of parsed.querySelectorAll("script, style, iframe, object"))
    unsafe.remove();
  for (const element of parsed.querySelectorAll("*")) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("on") || attribute.name === "style")
        element.removeAttribute(attribute.name);
    }
    if (element instanceof HTMLAnchorElement) {
      const protocol = new URL(element.href, window.location.origin).protocol;
      if (!["http:", "https:", "mailto:"].includes(protocol))
        element.removeAttribute("href");
      element.rel = "noopener noreferrer";
    }
    if (
      element instanceof HTMLImageElement &&
      !element.src.startsWith("data:image/") &&
      !element.src.startsWith("https://")
    )
      element.remove();
  }
  return parsed;
}

export function MailRichEditor({ initialHtml = "" }: { initialHtml?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  function syncHtml() {
    if (hiddenRef.current)
      hiddenRef.current.value = editorRef.current?.innerHTML ?? "";
  }

  useEffect(() => {
    const parsed = sanitizedEditorDocument(initialHtml);
    const safeHtml = parsed.body.innerHTML;
    editorRef.current?.replaceChildren(
      ...Array.from(parsed.body.childNodes, (node) =>
        document.importNode(node, true),
      ),
    );
    if (hiddenRef.current) hiddenRef.current.value = safeHtml;
  }, [initialHtml]);

  function addLink() {
    const href = window.prompt("Paste a link URL");
    if (!href) return;
    const url = new URL(href, window.location.origin);
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) return;
    editorCommand("createLink", url.toString());
  }

  function addInlineImage(file?: File) {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string")
        editorCommand("insertImage", reader.result);
      syncHtml();
    });
    reader.readAsDataURL(file);
  }

  const tools = [
    { label: "Bold", icon: Bold, run: () => editorCommand("bold") },
    { label: "Italic", icon: Italic, run: () => editorCommand("italic") },
    {
      label: "Underline",
      icon: Underline,
      run: () => editorCommand("underline"),
    },
    { label: "Insert link", icon: Link2, run: addLink },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-white/20">
      <div className="flex items-center gap-0.5 border-b border-white/[0.07] p-1.5">
        {tools.map((tool) => (
          <Button
            aria-label={tool.label}
            key={tool.label}
            onMouseDown={(event) => {
              event.preventDefault();
              tool.run();
              queueMicrotask(syncHtml);
            }}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <tool.icon className="size-3.5" />
          </Button>
        ))}
        <label className="grid size-8 cursor-pointer place-items-center rounded-md text-white/55 hover:bg-white/[0.06] hover:text-white">
          <ImagePlus className="size-3.5" />
          <span className="sr-only">Insert inline image</span>
          <input
            accept="image/*"
            className="sr-only"
            onChange={(event) => addInlineImage(event.target.files?.[0])}
            type="file"
          />
        </label>
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable is required for rich-text authoring. */}
      <div
        className="min-h-56 px-4 py-3 text-sm leading-6 text-white/80 outline-hidden [&_a]:text-cyan-300 [&_a]:underline [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg"
        contentEditable
        aria-label="Message body"
        onBlur={syncHtml}
        onInput={syncHtml}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
        tabIndex={0}
      />
      <input
        defaultValue={initialHtml}
        name="html"
        ref={hiddenRef}
        type="hidden"
      />
    </div>
  );
}
