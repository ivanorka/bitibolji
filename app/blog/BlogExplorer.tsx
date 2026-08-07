"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ArticleTheme } from "@/lib/articles";

type BlogItem = {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  readTime: number;
  image: string;
  imageAlt: string;
  theme: ArticleTheme;
};

const themes: Array<ArticleTheme | "Sve"> = [
  "Sve",
  "1000 ideja",
  "Financijska pismenost",
  "Mladi i škole",
  "Poduzetnički mindset",
  "Održiva budućnost",
];

export function BlogExplorer({ items }: { items: BlogItem[] }) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<ArticleTheme | "Sve">("Sve");
  const [visible, setVisible] = useState(12);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("hr");
    return items.filter((item) => {
      const matchesTheme = theme === "Sve" || item.theme === theme;
      const matchesQuery = !normalized || `${item.title} ${item.description}`.toLocaleLowerCase("hr").includes(normalized);
      return matchesTheme && matchesQuery;
    });
  }, [items, query, theme]);

  function chooseTheme(nextTheme: ArticleTheme | "Sve") {
    setTheme(nextTheme);
    setVisible(12);
  }

  return (
    <>
      <div className="blog-controls">
        <label className="blog-search">
          <span>Pretraži priče</span>
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setVisible(12); }}
            placeholder="Tema, škola, osoba…"
          />
        </label>
        <div className="theme-tabs" role="group" aria-label="Filtriraj po temi">
          {themes.map((item) => (
            <button
              type="button"
              key={item}
              className={theme === item ? "is-active" : ""}
              onClick={() => chooseTheme(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="results-line" aria-live="polite">
        <strong>{filtered.length}</strong> {filtered.length === 1 ? "priča" : "priče"}
        {theme !== "Sve" && <span> u temi “{theme}”</span>}
      </div>

      {filtered.length > 0 ? (
        <div className="archive-grid">
          {filtered.slice(0, visible).map((item) => (
            <article className="archive-card" key={item.slug}>
              <Link href={`/blog/${item.slug}`} className="archive-card-image" aria-label={item.title}>
                <img src={item.image} alt={item.imageAlt || ""} loading="lazy" />
                <span>{item.theme}</span>
              </Link>
              <div className="article-meta">
                <time dateTime={item.date}>{item.dateLabel}</time>
                <span>{item.readTime} min</span>
              </div>
              <h2><Link href={`/blog/${item.slug}`}>{item.title}</Link></h2>
              <p>{item.description}</p>
              <Link href={`/blog/${item.slug}`} className="text-link">Pročitaj <span>→</span></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>Nema priče s tim pojmom.</strong>
          <p>Pokušaj s drugom riječi ili odaberi sve teme.</p>
          <button type="button" onClick={() => { setQuery(""); chooseTheme("Sve"); }}>Prikaži sve priče</button>
        </div>
      )}

      {visible < filtered.length && (
        <div className="load-more-wrap">
          <button type="button" className="load-more" onClick={() => setVisible((count) => count + 12)}>
            Učitaj još <span>{Math.min(12, filtered.length - visible)}</span>
          </button>
        </div>
      )}
    </>
  );
}

