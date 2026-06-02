import { useMemo, useState } from "react";
import ArticleCard from "./ArticleCard";
import { useRssFeed } from "../hooks/useRssFeed";
import { SOURCES } from "../data/sources";

export default function ArticleFeed({ selectedSources, activeCategory, searchQuery }) {
  const sources = useMemo(
    () => SOURCES.filter((s) => selectedSources.includes(s.id)),
    [selectedSources]
  );

  const { articles, loading, errors, lastUpdated, reload } = useRssFeed(sources);

  const filtered = useMemo(() => {
    let list = articles;
    if (activeCategory !== "all") {
      list = list.filter((a) => a.categories.includes(activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, activeCategory, searchQuery]);

  const errorCount = Object.keys(errors).length;

  return (
    <div className="feed-container">
      <div className="feed-toolbar">
        <span className="feed-count">
          {loading ? "로딩 중..." : `${filtered.length}개 기사`}
          {lastUpdated && !loading && (
            <span className="last-updated">
              · 업데이트 {lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </span>
        <div className="feed-actions">
          {errorCount > 0 && (
            <span className="error-badge" title={Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join("\n")}>
              ⚠ {errorCount}개 소스 오류
            </span>
          )}
          <button className="reload-btn" onClick={reload} disabled={loading}>
            {loading ? "⟳" : "새로고침"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <p>
            {selectedSources.length === 0
              ? "뉴스 소스를 1개 이상 선택하세요."
              : "조건에 맞는 기사가 없습니다."}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="article-grid">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
