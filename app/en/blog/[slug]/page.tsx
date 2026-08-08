import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleAudioPlayer } from "@/components/ArticleAudioPlayer";
import { ArticleCard } from "@/components/ArticleCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArticleAudioChunks, getArticleAudioVersion, isElevenLabsAudioReady } from "@/lib/article-audio";
import {
  englishArticles,
  formatDate,
  getEnglishArticle,
  getEnglishRelatedArticles,
  getTheme,
} from "@/lib/articles";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return englishArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getEnglishArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `/en/blog/${article.slug}`,
      languages: { "hr-HR": `/blog/${article.slug}`, "en-US": `/en/blog/${article.slug}` },
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      locale: "en_US",
      images: [{ url: article.featuredImage, alt: article.featuredImageAlt }],
    },
  };
}

export default async function EnglishArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getEnglishArticle(slug);
  if (!article) notFound();
  const related = getEnglishRelatedArticles(article);
  const audioPartCount = getArticleAudioChunks(article).length;
  const audioVersion = getArticleAudioVersion(article);
  const audioReady = isElevenLabsAudioReady();

  return (
    <div lang="en">
      <SiteHeader locale="en" languageHref={`/blog/${article.slug}`} />
      <main>
        <article>
          <header className="article-hero">
            <div className="site-shell article-hero-inner">
              <Link href="/en/blog" className="back-link">← All stories</Link>
              <span className="article-theme article-theme--static">{getTheme(article, "en")}</span>
              <h1>{article.title}</h1>
              <p className="article-deck">{article.description}</p>
              <div className="article-meta-actions">
                <div className="article-byline">
                  <div className="byline-avatar">VM</div>
                  <div>
                    <strong>Vladimir Mihajlović</strong>
                    <span>{formatDate(article.date, "en")} · {article.readTime} min read</span>
                  </div>
                </div>
                <ArticleAudioPlayer
                  locale="en"
                  partCount={audioPartCount}
                  ready={audioReady}
                  slug={article.slug}
                  title={article.title}
                  version={audioVersion}
                />
              </div>
            </div>
          </header>
          <div className="site-shell article-cover">
            <img src={article.featuredImage} alt={article.featuredImageAlt || ""} />
          </div>
          <div className="site-shell article-layout">
            <aside className="article-aside">
              <span>Share the idea</span>
              <a href={`mailto:?subject=${encodeURIComponent(article.title)}`} aria-label="Send article by email">Email ↗</a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://bitibolji.orka.solutions/en/blog/${article.slug}`)}`}
                target="_blank"
                rel="noreferrer"
              >Facebook ↗</a>
            </aside>
            <div>
              <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
              <div className="source-note">
                <span>Archive note</span>
                <p>
                  This article was transferred from the Biti Bolji category on the Poduzetnik portal.
                  Original byline: <strong>{article.sourceAuthor}</strong>.
                </p>
                <a href={article.sourceUrl} target="_blank" rel="noreferrer">View the original in Croatian ↗</a>
              </div>
            </div>
          </div>
        </article>

        <section className="related-section section-pad">
          <div className="site-shell">
            <div className="section-heading section-heading--line">
              <div><p className="eyebrow"><span /> Keep reading</p><h2>Related <em>stories.</em></h2></div>
              <Link href="/en/blog" className="outline-link">All stories <span>→</span></Link>
            </div>
            <div className="related-grid">
              {related.map((item) => <ArticleCard article={item} locale="en" key={item.slug} />)}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </div>
  );
}
