import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { HtmlLanguage } from "@/components/HtmlLanguage";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() || (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: {
      default: "Biti bolji by Vladimir",
      template: "%s | Biti bolji",
    },
    description:
      "Znanje, iskustvo i stvarne prilike za mlade — projekt Vladimira Mihajlovića i Udruge Biti Bolji iz Osijeka.",
    keywords: ["Biti bolji", "Vladimir Mihajlović", "mladi", "poduzetništvo", "Osijek", "obrazovanje"],
    authors: [{ name: "Vladimir Mihajlović" }],
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      locale: "hr_HR",
      siteName: "Biti bolji by Vladimir",
      title: "Biti bolji — ideje koje mijenjaju budućnost",
      description: "Spajamo mlade, škole i poduzetnike kroz znanje, iskustvo i stvarne prilike.",
      images: [{ url: "/og.png", width: 1731, height: 909, alt: "Biti bolji — ideje koje mijenjaju budućnost" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Biti bolji — ideje koje mijenjaju budućnost",
      description: "Spajamo mlade, škole i poduzetnike kroz znanje, iskustvo i stvarne prilike.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <HtmlLanguage />
        {children}
      </body>
    </html>
  );
}
