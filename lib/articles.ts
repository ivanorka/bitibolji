import manifest from "@/content/articles.json";

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

export const articles = (manifest.articles as Article[]).sort(
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

export function getTheme(article: Pick<Article, "title" | "description">): ArticleTheme {
  const text = `${article.title} ${article.description}`.toLocaleLowerCase("hr");

  if (text.includes("1000 ideja")) return "1000 ideja";
  if (text.includes("novac") || text.includes("financijsk")) return "Financijska pismenost";
  if (text.includes("eko") || text.includes("zelen") || text.includes("okoliš")) return "Održiva budućnost";
  if (text.includes("poduzetnički mindset") || text.includes("poduzetnik")) return "Poduzetnički mindset";
  return "Mladi i škole";
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("hr-HR", {
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

