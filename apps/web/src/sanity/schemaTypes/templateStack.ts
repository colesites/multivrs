import { defineField, defineType } from "sanity";

export const templateStackType = defineType({
  name: "templateStack",
  title: "Template Stack",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: { select: { title: "name", media: "icon" } },
});
