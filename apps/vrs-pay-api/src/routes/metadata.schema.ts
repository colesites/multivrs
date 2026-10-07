import { z } from "zod";

const MAX_METADATA_KEYS = 50;
const MAX_METADATA_KEY_LENGTH = 40;
const MAX_METADATA_VALUE_LENGTH = 500;

/** Merchant key/value metadata, Stripe's limits. */
export const MetadataMap = z
  .record(z.string().max(MAX_METADATA_KEY_LENGTH), z.string().max(MAX_METADATA_VALUE_LENGTH))
  .refine((value) => Object.keys(value).length <= MAX_METADATA_KEYS, {
    message: `metadata can have at most ${MAX_METADATA_KEYS} keys`,
  });

/** Metadata on create: optional, empty by default. */
export const MetadataSchema = MetadataMap.default({});

export const HTTP_URL = z.url({ protocol: /^https?$/ });
