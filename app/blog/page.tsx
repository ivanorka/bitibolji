import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { articles, articleArchive, formatDate, getTheme } from "@/lib/articles";
import { BlogExplorer } from "./BlogExplorer";

export const metadata: Metadata = {
  title: "Priče i iskustva",
  description: "Sve priče iz projekta Biti Bolji — susreti, škole, ideje i ljudi koji mijenjaju budućnost mladih.",
};

export default function BlogPage() {
  const items = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    description: article.description,
    date: article.date,
    dateLabel: formatDate(article.date),
    readTime: article.readTime,
    image: article.featuredImage,
    imageAlt: article.featuredImageAlt,
    theme: getTheme(article),
  }));

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero page-hero--blog">
          <div className="site-shell page-hero-grid">
            <div>
              <p className="eyebrow"><span /> Arhiva Biti Bolji</p>
              <h1>Priče koje ostavljaju <em>trag.</em></h1>
            </div>
            <div className="archive-count">
              <strong>{articleArchive.articleCount}</strong>
              <span>priča iz učionica,<br />tvrtki i stvarnog života</span>
            </div>
          </div>
        </section>
        <section className="blog-archive section-pad">
          <div className="site-shell">
            <BlogExplorer items={items} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

