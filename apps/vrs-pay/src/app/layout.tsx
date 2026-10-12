import type { ReactNode } from "react";
import { ogImage, siteTitle } from "@/lib/site";
import "./globals.css";

const description =
  "VRS Pay is the payments API for developers: accept cards, wallets and local payment methods in 135+ currencies, run subscriptions, and settle across borders with one integration.";

export const metadata = {
  title: {
    template: "%s · VRS Pay",
    default: siteTitle,
  },
  description,
  openGraph: {
    title: siteTitle,
    description,
    type: "website",
    // No og:url here: each page's share should use its own address.
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description,
    images: [ogImage.url],
  },
};

// The document (<html>/<head>/<body>) lives in shell.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
