import { CATEGORIES, COUNTRY_FLAGS } from "../data/sources";

function timeAgo(date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function ArticleCard({ article }) {
  const catLabels = article.categories
    .map((c) => CATEGORIES.find((x) => x.id === c)?.label)
    .filter(Boolean);

  return (
    <a
      className="article-card"
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="article-meta">
        <span className="article-source">
          {COUNTRY_FLAGS[article.sourceCountry]} {article.sourceName}
        </span>
        <span className="article-time">{timeAgo(article.pubDate)}</span>
      </div>
      <h3 className="article-title">{article.title}</h3>
      {article.description && (
        <p className="article-desc">{article.description}…</p>
      )}
      <div className="article-tags">
        {catLabels.map((label) => (
          <span key={label} className="article-tag">
            {label}
          </span>
        ))}
      </div>
    </a>
  );
}
