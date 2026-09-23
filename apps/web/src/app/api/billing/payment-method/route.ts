import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";

export interface PaymentMethodSummary {
  hasPaymentMethod: boolean;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  email: string;
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) {
      return ok<PaymentMethodSummary>({ hasPaymentMethod: false, email: "" });
    }

    const sub = await prisma.billingSubscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { stripeCustomerId: true },
    });

    let customerId = sub?.stripeCustomerId;
    if (!customerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripe();
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        customerId = customers.data[0]?.id;
      } catch {
        // Stripe query may fail if keys are invalid or not configured
      }
    }

    if (customerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripe();
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customerId,
          type: "card",
          limit: 1,
        });
        const card = paymentMethods.data[0]?.card;
        if (card) {
          return ok<PaymentMethodSummary>({
            hasPaymentMethod: true,
            brand: card.brand,
            last4: card.last4,
            expMonth: card.exp_month,
            expYear: card.exp_year,
            email: user.email,
          });
        }
      } catch {
        // Ignore payment method list failure
      }
    }

    return ok<PaymentMethodSummary>({
      hasPaymentMethod: false,
      email: user.email,
    });
  } catch (error) {
    return fail(error);
  }
}
