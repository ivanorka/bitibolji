import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function EnglishNotFound() {
  return (
    <div lang="en">
      <SiteHeader locale="en" languageHref="/" />
      <main className="not-found site-shell">
        <span>404</span>
        <h1>This idea has not been found yet.</h1>
        <p>Return to the stories that are already shaping the future.</p>
        <Link href="/en/blog" className="button button--dark">Explore stories →</Link>
      </main>
    </div>
  );
}
