import { z } from "zod";
import { ADD_ON_KEYS } from "@/lib/payments/billing.types";

const scopeId = z.union([z.literal("personal"), z.uuid()]);

export const updateBillingAddOnSchema = z.object({
  addOn: z.enum(ADD_ON_KEYS),
  operationId: z.uuid(),
  projectIds: z.array(z.uuid()).max(100).default([]),
  quantity: z.number().int().min(0).max(1_000),
  scopeId,
});

export const updateSpendPolicySchema = z
  .object({
    operationId: z.uuid(),
    overagesEnabled: z.boolean(),
    scopeId,
    spendAlertCents: z.number().int().min(100).max(10_000_000).nullable(),
    spendLimitCents: z.number().int().min(100).max(10_000_000).nullable(),
  })
  .refine(
    (value) =>
      value.spendAlertCents === null ||
      value.spendLimitCents === null ||
      value.spendAlertCents <= value.spendLimitCents,
    { message: "The spend alert cannot exceed the spend limit" },
  );

export const billingPortalSchema = z.object({ scopeId });

const addOnSummarySchema = z.object({
  key: z.enum(ADD_ON_KEYS),
  projectIds: z.array(z.uuid()),
  quantity: z.number().int().nonnegative(),
});

export const billingOverviewSchema = z.object({
  scopes: z.array(
    z.object({
      addOns: z.array(addOnSummarySchema),
      canManage: z.boolean(),
      currentPeriodEnd: z.string().nullable(),
      estimatedUsageCents: z.number().int().nonnegative(),
      invoices: z.array(
        z.object({
          amountDueCents: z.number().int(),
          currency: z.string(),
          hostedInvoiceUrl: z.string().nullable(),
          id: z.string(),
          status: z.string(),
        }),
      ),
      name: z.string(),
      overagesEnabled: z.boolean(),
      plan: z.enum(["hobby", "pro", "enterprise"]),
      projects: z.array(z.object({ id: z.uuid(), name: z.string() })),
      scopeId,
      spendAlertCents: z.number().int().nullable(),
      spendLimitCents: z.number().int().nullable(),
      status: z.string(),
      subscriptionId: z.uuid().nullable(),
    }),
  ),
});

export const billingUpdatedSchema = z.object({ updated: z.literal(true) });
export const billingPortalResponseSchema = z.object({ url: z.url() });
