import sanitizeHtml from "sanitize-html";

export function sanitizeMailHtml(value?: string): string | undefined {
  if (!value) return undefined;
  return sanitizeHtml(value, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "title"],
      a: ["href", "name", "target", "rel"],
      img: ["alt", "height", "width", "data-remote-src", "src"],
    },
    allowedSchemes: ["https", "mailto", "cid", "data"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
      img: (tagName, attributes) => {
        const src = attributes.src;
        if (src?.startsWith("http")) {
          return {
            tagName,
            attribs: { ...attributes, "data-remote-src": src, src: "" },
          };
        }
        return { tagName, attribs: attributes };
      },
    },
  });
}
