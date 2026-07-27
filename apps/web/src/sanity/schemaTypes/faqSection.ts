import { defineField, defineType } from "sanity";

export const faqSectionType = defineType({
  name: "faqSection",
  title: "FAQ Section Header",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "page",
      title: "Target Page",
      type: "string",
      options: {
        list: [
          { title: "Home Page", value: "home" },
          { title: "Pricing Page", value: "pricing" },
          { title: "All Pages", value: "all" },
        ],
      },
      initialValue: "all",
    }),
  ],
});
