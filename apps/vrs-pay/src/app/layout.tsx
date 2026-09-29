import type { ReactNode } from "react";
import "./globals.css";

const description =
  "VRS Pay is the payments API for developers: accept cards, wallets and local payment methods in 135+ currencies, run subscriptions, and settle across borders with one integration.";

export const metadata = {
  title: {
    template: "%s · VRS Pay",
    default: "VRS Pay — Payment integration across every border",
  },
  description,
  openGraph: {
    title: "VRS Pay — Payment integration across every border",
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VRS Pay — Payment integration across every border",
    description,
  },
};

// The document (<html>/<head>/<body>) lives in shell.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
