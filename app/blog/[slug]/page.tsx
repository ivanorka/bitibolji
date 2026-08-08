import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleAudioPlayer } from "@/components/ArticleAudioPlayer";
import { ArticleCard } from "@/components/ArticleCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { articles, formatDate, getArticle, getRelatedArticles, getTheme } from "@/lib/articles";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `/blog/${article.slug}`,
      languages: { "hr-HR": `/blog/${article.slug}`, "en-US": `/en/blog/${article.slug}` },
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      images: [{ url: article.featuredImage, alt: article.featuredImageAlt }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = getRelatedArticles(article);

  return (
    <>
      <SiteHeader languageHref={`/en/blog/${article.slug}`} />
      <main>
        <article>
          <header className="article-hero">
            <div className="site-shell article-hero-inner">
              <Link href="/blog" className="back-link">← Sve priče</Link>
              <span className="article-theme article-theme--static">{getTheme(article)}</span>
              <h1>{article.title}</h1>
              <p className="article-deck">{article.description}</p>
              <div className="article-meta-actions">
                <div className="article-byline">
                  <div className="byline-avatar">VM</div>
                  <div>
                    <strong>Vladimir Mihajlović</strong>
                    <span>{formatDate(article.date)} · {article.readTime} min čitanja</span>
                  </div>
                </div>
                <ArticleAudioPlayer title={article.title} />
              </div>
            </div>
          </header>
          <div className="site-shell article-cover">
            <img src={article.featuredImage} alt={article.featuredImageAlt || ""} />
          </div>
          <div className="site-shell article-layout">
            <aside className="article-aside">
              <span>Podijeli ideju</span>
              <a href={`mailto:?subject=${encodeURIComponent(article.title)}`} aria-label="Pošalji članak e-poštom">E-pošta ↗</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://poduzetnik.biz/biti-bolji/${article.slug}/`)}`} target="_blank" rel="noreferrer">Facebook ↗</a>
            </aside>
            <div>
              <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
              <div className="source-note">
                <span>Arhivska bilješka</span>
                <p>
                  Ovaj tekst je prenesen iz kategorije Biti bolji na portalu Poduzetnik.
                  Izvorni potpis: <strong>{article.sourceAuthor}</strong>.
                </p>
                <a href={article.sourceUrl} target="_blank" rel="noreferrer">Pogledaj izvornik ↗</a>
              </div>
            </div>
          </div>
        </article>

        <section className="related-section section-pad">
          <div className="site-shell">
            <div className="section-heading section-heading--line">
              <div><p className="eyebrow"><span /> Nastavi čitati</p><h2>Slične <em>priče.</em></h2></div>
              <Link href="/blog" className="outline-link">Sve priče <span>→</span></Link>
            </div>
            <div className="related-grid">
              {related.map((item) => <ArticleCard article={item} key={item.slug} />)}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
