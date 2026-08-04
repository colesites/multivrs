import { z } from "zod";
import type {
  AddOnKey,
  AddOnState,
  PlanKey,
} from "@/lib/payments/billing.types";
import { ADD_ON_KEYS, PLAN_KEYS } from "@/lib/payments/billing.types";
import { prisma } from "@/lib/prisma";

const entitlementSchema = z.record(
  z.string(),
  z.number().int().nonnegative().nullable(),
);
const rateSchema = z.record(z.string(), z.number().int().nonnegative());

type BillingItem = { key: string; projectIds: string[]; quantity: number };

export function addOnState(items: BillingItem[]): AddOnState {
  const state: AddOnState = {};
  for (const item of items) {
    if (isAddOnKey(item.key)) {
      state[item.key] = (state[item.key] ?? 0) + item.quantity;
    }
  }
  return state;
}

export function parseEntitlementOverrides(
  value: unknown,
): Record<string, number | null> {
  return parseRecord(entitlementSchema, value);
}

export function parseRateOverrides(value: unknown): Record<string, number> {
  return parseRecord(rateSchema, value);
}

export function planKey(value?: string): PlanKey {
  return PLAN_KEYS.find((key) => key === value) ?? (value ? "pro" : "hobby");
}

export function projectBillingScope(projectId: string) {
  return prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { organizationId: true, ownerId: true },
  });
}

export function periodFallback(date: Date): { end: Date; start: Date } {
  return {
    end: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)),
    start: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
  };
}

function isAddOnKey(value: string): value is AddOnKey {
  return ADD_ON_KEYS.some((key) => key === value);
}

function parseRecord<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : schema.parse({});
}
