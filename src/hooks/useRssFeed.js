import { useState, useEffect, useCallback } from "react";

const CORS_PROXY = "https://api.allorigins.win/get?url=";

async function fetchRss(source) {
  const targetUrl = encodeURIComponent(source.rss);
  const res = await fetch(`${CORS_PROXY}${targetUrl}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const text = data.contents;

  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  const items = xml.querySelectorAll("item");

  return Array.from(items)
    .slice(0, 10)
    .map((item) => {
      const get = (tag) => item.querySelector(tag)?.textContent?.trim() ?? "";
      const pubDate = get("pubDate");
      return {
        id: get("guid") || get("link"),
        title: get("title"),
        link: get("link"),
        description: get("description").replace(/<[^>]+>/g, "").slice(0, 160),
        pubDate: pubDate ? new Date(pubDate) : new Date(),
        sourceId: source.id,
        sourceName: source.name,
        sourceCountry: source.country,
        categories: source.categories,
      };
    })
    .filter((item) => item.title && item.link);
}

export function useRssFeed(sources) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    if (!sources.length) return;
    setLoading(true);
    setErrors({});

    const results = await Promise.allSettled(sources.map(fetchRss));

    const newErrors = {};
    const newArticles = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        newArticles.push(...result.value);
      } else {
        newErrors[sources[i].id] = result.reason?.message ?? "Failed";
      }
    });

    newArticles.sort((a, b) => b.pubDate - a.pubDate);
    setArticles(newArticles);
    setErrors(newErrors);
    setLastUpdated(new Date());
    setLoading(false);
  }, [sources]);

  useEffect(() => {
    load();
  }, [load]);

  return { articles, loading, errors, lastUpdated, reload: load };
}
