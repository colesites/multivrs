import { defineField, defineType } from "sanity";

export const faqType = defineType({
  name: "faq",
  title: "FAQ Item",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "faqCategory" }],
      description: "Select declared FAQ category",
    }),
    defineField({
      name: "page",
      title: "Target Page",
      type: "string",
      options: {
        list: [
          { title: "All Pages", value: "all" },
          { title: "Home Page", value: "home" },
          { title: "Pricing Page", value: "pricing" },
        ],
      },
      initialValue: "all",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "question",
      subtitle: "category.title",
    },
  },
});
