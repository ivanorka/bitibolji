import Link from "next/link";
import { Article, formatDate, getTheme } from "@/lib/articles";

export function ArticleCard({ article, large = false, locale = "hr" }: { article: Article; large?: boolean; locale?: "hr" | "en" }) {
  const english = locale === "en";
  const theme = getTheme(article, locale);
  const articleHref = `${english ? "/en" : ""}/blog/${article.slug}`;

  return (
    <article className={`article-card${large ? " article-card--large" : ""}`}>
      <Link href={articleHref} className="article-card-media" aria-label={article.title}>
        <img
          src={article.featuredImage}
          alt={article.featuredImageAlt || ""}
          loading={large ? "eager" : "lazy"}
        />
        <span className="article-theme">{theme}</span>
      </Link>
      <div className="article-card-body">
        <div className="article-meta">
          <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
          <span>{article.readTime} {english ? "min read" : "min čitanja"}</span>
        </div>
        <h3>
          <Link href={articleHref}>{article.title}</Link>
        </h3>
        {large && <p>{article.description}</p>}
        <Link href={articleHref} className="text-link">
          {english ? "Read the story" : "Pročitaj priču"} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
