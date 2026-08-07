import manifest from "@/content/articles.json";
import englishManifest from "@/content/articles-en.json";

export type Article = {
  id: number;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  modified: string;
  author: string;
  sourceAuthor: string;
  sourceUrl: string;
  featuredImage: string;
  featuredImageAlt: string;
  readTime: number;
  content: string;
};

export type ArticleTheme =
  | "1000 ideja"
  | "Financijska pismenost"
  | "Održiva budućnost"
  | "Poduzetnički mindset"
  | "Mladi i škole";

export type EnglishArticleTheme =
  | "1000 Ideas"
  | "Financial literacy"
  | "Sustainable future"
  | "Entrepreneurial mindset"
  | "Young people and schools";

export type Locale = "hr" | "en";

export const articles = (manifest.articles as Article[]).sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export const englishArticles = (englishManifest.articles as Article[]).sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export const articleArchive = {
  source: manifest.source,
  importedAt: manifest.importedAt,
  articleCount: manifest.articleCount,
  imageCount: manifest.imageCount,
};

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getEnglishArticle(slug: string) {
  return englishArticles.find((article) => article.slug === slug);
}

function getThemeKey(article: Pick<Article, "title" | "description"> & Partial<Pick<Article, "id">>) {
  const original = article.id ? articles.find((item) => item.id === article.id) : undefined;
  const text = `${original?.title ?? article.title} ${original?.description ?? article.description}`.toLocaleLowerCase("hr");

  if (text.includes("1000 ideja")) return "ideas";
  if (text.includes("novac") || text.includes("financijsk")) return "finance";
  if (text.includes("eko") || text.includes("zelen") || text.includes("okoliš")) return "sustainability";
  if (text.includes("poduzetnički mindset") || text.includes("poduzetnik")) return "mindset";
  return "youth";
}

export function getTheme(
  article: Pick<Article, "title" | "description"> & Partial<Pick<Article, "id">>,
  locale?: "hr",
): ArticleTheme;
export function getTheme(
  article: Pick<Article, "title" | "description"> & Partial<Pick<Article, "id">>,
  locale: "en",
): EnglishArticleTheme;
export function getTheme(
  article: Pick<Article, "title" | "description"> & Partial<Pick<Article, "id">>,
  locale: Locale,
): ArticleTheme | EnglishArticleTheme;
export function getTheme(
  article: Pick<Article, "title" | "description"> & Partial<Pick<Article, "id">>,
  locale: Locale = "hr",
): ArticleTheme | EnglishArticleTheme {
  const key = getThemeKey(article);
  const labels = locale === "en"
    ? {
        ideas: "1000 Ideas",
        finance: "Financial literacy",
        sustainability: "Sustainable future",
        mindset: "Entrepreneurial mindset",
        youth: "Young people and schools",
      } as const
    : {
        ideas: "1000 ideja",
        finance: "Financijska pismenost",
        sustainability: "Održiva budućnost",
        mindset: "Poduzetnički mindset",
        youth: "Mladi i škole",
      } as const;

  return labels[key];
}

export function formatDate(date: string, locale: Locale = "hr") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getRelatedArticles(article: Article, limit = 3) {
  const theme = getTheme(article);
  return articles
    .filter((candidate) => candidate.slug !== article.slug)
    .sort((a, b) => {
      const aMatch = getTheme(a) === theme ? 1 : 0;
      const bMatch = getTheme(b) === theme ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}

export function getEnglishRelatedArticles(article: Article, limit = 3) {
  const theme = getThemeKey(article);
  return englishArticles
    .filter((candidate) => candidate.slug !== article.slug)
    .sort((a, b) => {
      const aMatch = getThemeKey(a) === theme ? 1 : 0;
      const bMatch = getThemeKey(b) === theme ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}
