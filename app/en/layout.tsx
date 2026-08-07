import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Biti bolji by Vladimir",
    title: "Biti bolji — ideas that shape the future",
    description: "We connect young people, schools and entrepreneurs through knowledge, experience and real opportunities.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Biti bolji — ideas that shape the future" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biti bolji — ideas that shape the future",
    description: "We connect young people, schools and entrepreneurs through knowledge, experience and real opportunities.",
    images: ["/og.png"],
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
