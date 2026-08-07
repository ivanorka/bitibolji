import type { MetadataRoute } from "next";
import { articles } from "@/lib/articles";

const baseUrl = "https://bitibolji.orka.solutions";

function localizedEntry(
  path: string,
  englishPath: string,
  language: "hr" | "en",
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${language === "en" ? englishPath : path}`,
    lastModified: lastModified ?? new Date(),
    changeFrequency: path.includes("/blog/") ? "monthly" : "weekly",
    priority: path === "/" ? 1 : path === "/blog" ? 0.9 : 0.7,
    alternates: {
      languages: {
        hr: `${baseUrl}${path}`,
        en: `${baseUrl}${englishPath}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    ["/", "/en"],
    ["/blog", "/en/blog"],
    ["/o-nama", "/en/about"],
    ["/ukljuci-se", "/en/get-involved"],
  ] as const;

  const staticEntries = pages.flatMap(([path, englishPath]) => [
    localizedEntry(path, englishPath, "hr"),
    localizedEntry(path, englishPath, "en"),
  ]);

  const articleEntries = articles.flatMap((article) => {
    const path = `/blog/${article.slug}`;
    const englishPath = `/en/blog/${article.slug}`;
    const lastModified = new Date(article.modified || article.date);
    return [
      localizedEntry(path, englishPath, "hr", lastModified),
      localizedEntry(path, englishPath, "en", lastModified),
    ];
  });

  return [...staticEntries, ...articleEntries];
}
