import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found site-shell">
        <span>404</span>
        <h1>Ova ideja još nije pronađena.</h1>
        <p>Vrati se među priče koje već mijenjaju budućnost.</p>
        <Link href="/blog" className="button button--dark">Istraži priče →</Link>
      </main>
    </>
  );
}
