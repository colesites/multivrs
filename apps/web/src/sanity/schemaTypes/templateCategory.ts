import { defineField, defineType } from "sanity";

export const templateCategoryType = defineType({
  name: "templateCategory",
  title: "Template Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Category Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
});
