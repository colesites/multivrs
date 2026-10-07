import { useDashboard } from "../context";
import type { AccountSetup, StepId } from "../types";
import { Button, Input, Textarea } from "../ui";
import { ProductForm } from "./product-form";
import { Field, SectionCard, SectionForm, value } from "./section-form";
import { IdentityForm } from "./setup-identity";
import { PayoutForm } from "./setup-payout";

interface SectionProps {
  setup: AccountSetup;
  onSaved: (setup: AccountSetup) => void;
}

export const isDone = (setup: AccountSetup, ...ids: StepId[]) =>
  ids.every((id) => setup.steps.find((s) => s.id === id)?.done);

export function ProductSection({
  setup,
  onCreated,
}: {
  setup: AccountSetup;
  onCreated: () => void;
}) {
  const { navigate } = useDashboard();
  const done = isDone(setup, "product");
  return (
    <SectionCard
      title="Your first product"
      description="Something customers can buy: a name, a description and a price."
      done={done}
    >
      {done ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            You have a product for sale. Add more, or change prices, on the
            Products page.
          </p>
          <Button
            type="button"
            onClick={() => navigate("products")}
            variant="outline"
          >
            Manage products
          </Button>
        </div>
      ) : (
        <ProductForm onCreated={onCreated} />
      )}
    </SectionCard>
  );
}

export function IdentitySection({ setup, onSaved }: SectionProps) {
  return (
    <SectionCard
      title="Verify your identity"
      description="Where your business is based, and one official ID from there, like your BVN or NIN in Nigeria."
      done={isDone(setup, "identity")}
    >
      <IdentityForm setup={setup} onSaved={onSaved} />
    </SectionCard>
  );
}

export function PayoutSection({ setup, onSaved }: SectionProps) {
  return (
    <SectionCard
      title="Where we pay you"
      description="The bank account your balance is paid into."
      done={isDone(setup, "payout")}
    >
      <PayoutForm setup={setup} onSaved={onSaved} />
    </SectionCard>
  );
}

export function AboutSection({ setup, onSaved }: SectionProps) {
  const { details } = setup;
  return (
    <SectionForm
      title="About your business"
      description="What you sell, and where customers find you and get help."
      done={isDone(setup, "description", "website", "support_email")}
      onSaved={onSaved}
      toBody={(f) => ({
        product_description: value(f, "product_description"),
        website: value(f, "website"),
        support_email: value(f, "support_email"),
      })}
    >
      <Field label="Product website">
        <Input
          name="website"
          type="url"
          required
          defaultValue={details.website ?? ""}
          placeholder="https://"
        />
      </Field>
      <Field label="Support email" hint="Shown to customers on receipts.">
        <Input
          name="support_email"
          type="email"
          required
          defaultValue={details.support_email ?? ""}
          placeholder="help@yourbusiness.com"
        />
      </Field>
      <div className="sm:col-span-2">
        <Field
          label="What do you sell?"
          hint="What it is, who it's for, and how you charge."
        >
          <Textarea
            name="product_description"
            required
            maxLength={500}
            rows={3}
            defaultValue={details.product_description ?? ""}
            placeholder="e.g. A booking app for restaurants, sold as a monthly subscription"
          />
        </Field>
      </div>
    </SectionForm>
  );
}
