import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const acari = localFont({
  src: [
    {
      path: "../../public/fonts/AcariSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/AcariSans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/AcariSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/AcariSans-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-acari",
});

const clashDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/ClashDisplay-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashDisplay-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashDisplay-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash",
});

const SITE_URL = "https://multivrs.dev";
const SITE_NAME = "MULTIVRS";
const SITE_DESCRIPTION =
  "MULTIVRS builds premium digital experiences that push boundaries. We craft next-generation software, immersive interfaces, and scalable platforms for ambitious brands.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Build Beyond Limits`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "software agency",
    "web development",
    "digital experiences",
    "premium software",
    "Next.js",
    "React",
    "3D web",
    "immersive design",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Build Beyond Limits`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Build Beyond Limits`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${acari.variable} ${clashDisplay.variable} h-full antialiased dark`}
    >
      <head>
        <meta name="theme-color" content="#030303" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-inter">
        {children}
      </body>
    </html>
  );
}
