import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DomainCheckoutPage } from "@/features/domains/DomainCheckoutPage";
import { auth } from "@/lib/auth";
import { buildSignInHref } from "@/lib/auth/return-path";
import { isOpenproviderSandbox } from "@/lib/domains/openprovider-client";
export default async function CheckoutPage() {
  const requestHeaders = await headers();
  const returnPath = "/domains/checkout";
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect(buildSignInHref(returnPath));

  return (
    <DomainCheckoutPage
      sandboxEnabled={isOpenproviderSandbox()}
      user={{
        email: session.user.email,
        name: session.user.name,
        username: session.user.username ?? "dashboard",
      }}
    />
  );
}
