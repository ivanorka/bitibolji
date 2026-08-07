import type { Metadata } from "next";
import { BlogExplorer } from "@/app/blog/BlogExplorer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { articleArchive, englishArticles, formatDate, getTheme } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Stories and experiences",
  description: "Every story from Biti Bolji — encounters, schools, ideas and people shaping a better future for young people.",
  alternates: {
    canonical: "/en/blog",
    languages: { "hr-HR": "/blog", "en-US": "/en/blog" },
  },
};

export default function EnglishBlogPage() {
  const items = englishArticles.map((article) => ({
    slug: article.slug,
    title: article.title,
    description: article.description,
    date: article.date,
    dateLabel: formatDate(article.date, "en"),
    readTime: article.readTime,
    image: article.featuredImage,
    imageAlt: article.featuredImageAlt,
    theme: getTheme(article, "en"),
  }));

  return (
    <div lang="en">
      <SiteHeader locale="en" languageHref="/blog" />
      <main>
        <section className="page-hero page-hero--blog">
          <div className="site-shell page-hero-grid">
            <div>
              <p className="eyebrow"><span /> Biti Bolji archive</p>
              <h1>Stories that leave <em>a mark.</em></h1>
            </div>
            <div className="archive-count">
              <strong>{articleArchive.articleCount}</strong>
              <span>stories from classrooms,<br />companies and real life</span>
            </div>
          </div>
        </section>
        <section className="blog-archive section-pad">
          <div className="site-shell">
            <BlogExplorer items={items} locale="en" />
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </div>
  );
}
