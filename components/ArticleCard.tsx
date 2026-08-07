import Link from "next/link";
import { Article, formatDate, getTheme } from "@/lib/articles";

export function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  const theme = getTheme(article);

  return (
    <article className={`article-card${large ? " article-card--large" : ""}`}>
      <Link href={`/blog/${article.slug}`} className="article-card-media" aria-label={article.title}>
        <img
          src={article.featuredImage}
          alt={article.featuredImageAlt || ""}
          loading={large ? "eager" : "lazy"}
        />
        <span className="article-theme">{theme}</span>
      </Link>
      <div className="article-card-body">
        <div className="article-meta">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span>{article.readTime} min čitanja</span>
        </div>
        <h3>
          <Link href={`/blog/${article.slug}`}>{article.title}</Link>
        </h3>
        {large && <p>{article.description}</p>}
        <Link href={`/blog/${article.slug}`} className="text-link">
          Pročitaj priču <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

