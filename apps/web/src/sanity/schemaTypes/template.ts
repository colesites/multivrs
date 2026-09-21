import { defineArrayMember, defineField, defineType } from "sanity";

export const templateType = defineType({
  name: "template",
  title: "Marketplace Template",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Template name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "templateCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
    }),
    defineField({
      name: "githubRepository",
      title: "Private GitHub repository",
      type: "url",
      validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "price",
      title: "Price (USD)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "stack",
      title: "Stack",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "templateStack" }],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: "previewUrl",
      title: "Preview link",
      type: "url",
      validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "sellerId",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Review status",
      type: "string",
      options: { list: ["draft", "in_review", "published", "rejected"] },
      initialValue: "draft",
    }),
    defineField({
      name: "likes",
      title: "Likes count",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "views",
      title: "Views count",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", media: "coverImage", subtitle: "status" },
  },
});
