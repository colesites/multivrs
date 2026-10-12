import type { Db } from "../../db/client";
import type { CheckoutSessionStore } from "../checkout-session.store";
import { writeEffects } from "./effects";
import { sessionFromRow } from "./mappers";

export function createPrismaCheckoutSessionStore(db: Db): CheckoutSessionStore {
  return {
    async save({ merchantId, mode, session }) {
      await db.checkoutSession.create({
        data: {
          id: session.id,
          merchantId,
          mode,
          status: session.status,
          checkoutMode: session.mode,
          customerId: session.customer,
          subscriptionId: session.subscription,
          paymentLinkId: session.payment_link,
          amount: BigInt(session.amount),
          currency: session.currency.toUpperCase(),
          paymentMethod: session.payment_method,
          description: session.description,
          provider: session.provider,
          providerReference: session.provider_reference,
          url: session.url,
          platformFee: BigInt(session.platform_fee),
          successUrl: session.success_url,
          cancelUrl: session.cancel_url,
          customerEmail: session.customer_email,
          metadata: {
            ...(typeof session.metadata === "object" && session.metadata !== null
              ? session.metadata
              : {}),
            ...(session.client_secret ? { _client_secret: session.client_secret } : {}),
          },
          createdAt: new Date(session.created * 1000),
        },
      });
    },
    async get(merchantId, mode, id) {
      const row = await db.checkoutSession.findFirst({ where: { id, merchantId, mode } });
      return row ? sessionFromRow(row).session : null;
    },
    async findById(id) {
      const row = await db.checkoutSession.findUnique({ where: { id } });
      return row ? sessionFromRow(row) : null;
    },
    async findByReference(provider, reference) {
      const row = await db.checkoutSession.findUnique({
        where: { provider_providerReference: { provider, providerReference: reference } },
      });
      return row ? sessionFromRow(row) : null;
    },
    async setHostedCheckout(id, url, customerEmail) {
      const { count } = await db.checkoutSession.updateMany({
        where: { id, status: "open" },
        data: { url, customerEmail },
      });
      return count === 1;
    },
    async expire(id, effects) {
      return db.$transaction(async (tx) => {
        const { count } = await tx.checkoutSession.updateMany({
          where: { id, status: "open" },
          data: { status: "expired" },
        });
        if (count === 0) return null;
        const row = await tx.checkoutSession.findUniqueOrThrow({ where: { id } });
        const updated = sessionFromRow(row);
        await writeEffects(tx, effects(updated));
        return updated;
      });
    },
    async metrics(merchantId, mode, since) {
      const where = {
        merchantId,
        mode,
        ...(since ? { createdAt: { gte: new Date(since * 1000) } } : {}),
      };
      const [total, completed] = await Promise.all([
        db.checkoutSession.count({ where }),
        db.checkoutSession.count({ where: { ...where, status: "complete" } }),
      ]);
      return { total, completed };
    },
  };
}
