"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type BlogItem = {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  readTime: number;
  image: string;
  imageAlt: string;
  theme: string;
};

export function BlogExplorer({ items, locale = "hr" }: { items: BlogItem[]; locale?: "hr" | "en" }) {
  const english = locale === "en";
  const allLabel = english ? "All" : "Sve";
  const themes = english
    ? ["All", "1000 Ideas", "Financial literacy", "Young people and schools", "Entrepreneurial mindset", "Sustainable future"]
    : ["Sve", "1000 ideja", "Financijska pismenost", "Mladi i škole", "Poduzetnički mindset", "Održiva budućnost"];
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(allLabel);
  const [visible, setVisible] = useState(12);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return items.filter((item) => {
      const matchesTheme = theme === allLabel || item.theme === theme;
      const matchesQuery = !normalized || `${item.title} ${item.description}`.toLocaleLowerCase(locale).includes(normalized);
      return matchesTheme && matchesQuery;
    });
  }, [allLabel, items, locale, query, theme]);

  function chooseTheme(nextTheme: string) {
    setTheme(nextTheme);
    setVisible(12);
  }

  return (
    <>
      <div className="blog-controls">
        <label className="blog-search">
          <span>{english ? "Search stories" : "Pretraži priče"}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setVisible(12); }}
            placeholder={english ? "Topic, school, person…" : "Tema, škola, osoba…"}
          />
        </label>
        <div className="theme-tabs" role="group" aria-label={english ? "Filter by topic" : "Filtriraj po temi"}>
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
        <strong>{filtered.length}</strong> {english ? (filtered.length === 1 ? "story" : "stories") : (filtered.length === 1 ? "priča" : "priče")}
        {theme !== allLabel && <span>{english ? " in" : " u temi"} “{theme}”</span>}
      </div>

      {filtered.length > 0 ? (
        <div className="archive-grid">
          {filtered.slice(0, visible).map((item) => (
            <article className="archive-card" key={item.slug}>
              <Link href={`${english ? "/en" : ""}/blog/${item.slug}`} className="archive-card-image" aria-label={item.title}>
                <img src={item.image} alt={item.imageAlt || ""} loading="lazy" />
                <span>{item.theme}</span>
              </Link>
              <div className="article-meta">
                <time dateTime={item.date}>{item.dateLabel}</time>
                <span>{item.readTime} min</span>
              </div>
              <h2><Link href={`${english ? "/en" : ""}/blog/${item.slug}`}>{item.title}</Link></h2>
              <p>{item.description}</p>
              <Link href={`${english ? "/en" : ""}/blog/${item.slug}`} className="text-link">{english ? "Read" : "Pročitaj"} <span>→</span></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>{english ? "No story matches that search." : "Nema priče s tim pojmom."}</strong>
          <p>{english ? "Try another word or select all topics." : "Pokušaj s drugom riječi ili odaberi sve teme."}</p>
          <button type="button" onClick={() => { setQuery(""); chooseTheme(allLabel); }}>{english ? "Show all stories" : "Prikaži sve priče"}</button>
        </div>
      )}

      {visible < filtered.length && (
        <div className="load-more-wrap">
          <button type="button" className="load-more" onClick={() => setVisible((count) => count + 12)}>
            {english ? "Load more" : "Učitaj još"} <span>{Math.min(12, filtered.length - visible)}</span>
          </button>
        </div>
      )}
    </>
  );
}
