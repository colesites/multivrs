import { FlaskConical, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";

export function SandboxCheckout({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="py-8 text-center">
      <FlaskConical className="mx-auto size-8 text-cyan-300" />
      <h2 className="mt-4 text-xl font-medium">Local sandbox checkout</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
        This safely simulates registration and DNS. No payment or live domain
        purchase occurs.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={onSubmit}
        className="mx-auto mt-7 flex h-11 items-center justify-center gap-2 bg-white px-6 font-medium text-black disabled:opacity-50"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <LockKeyhole className="size-4" />
        )}
        {pending ? "Registering…" : "Complete sandbox order"}
      </button>
    </div>
  );
}

export function EmptyCheckout() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 text-center text-white">
      <div>
        <h1 className="font-clash text-3xl font-semibold">
          Your cart is empty
        </h1>
        <Link
          href="/domains"
          className="mt-5 inline-block text-sm text-cyan-300"
        >
          Return to domain search
        </Link>
      </div>
    </main>
  );
}

export function CheckoutLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-black text-white">
      <LoaderCircle className="size-6 animate-spin text-white/40" />
    </main>
  );
}
