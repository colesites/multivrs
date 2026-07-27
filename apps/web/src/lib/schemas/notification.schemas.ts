import { z } from "zod";

export const notificationMutationSchema = z
  .object({
    action: z.enum(["archive", "read", "read_all"]),
    id: z.uuid().optional(),
  })
  .superRefine((value, context) => {
    if (value.action !== "read_all" && !value.id) {
      context.addIssue({
        code: "custom",
        message: "Notification id is required",
      });
    }
  });

export const notificationTypeSchema = z.enum([
  "error",
  "info",
  "success",
  "warning",
]);
