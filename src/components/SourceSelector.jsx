import { SOURCES, COUNTRY_FLAGS, CATEGORIES } from "../data/sources";

export default function SourceSelector({ selectedSources, onChange, activeCategory }) {
  const filtered =
    activeCategory === "all"
      ? SOURCES
      : SOURCES.filter((s) => s.categories.includes(activeCategory));

  const allSelected = filtered.every((s) => selectedSources.includes(s.id));

  function toggleAll() {
    if (allSelected) {
      onChange(selectedSources.filter((id) => !filtered.map((s) => s.id).includes(id)));
    } else {
      const add = filtered.map((s) => s.id).filter((id) => !selectedSources.includes(id));
      onChange([...selectedSources, ...add]);
    }
  }

  function toggle(id) {
    if (selectedSources.includes(id)) {
      onChange(selectedSources.filter((x) => x !== id));
    } else {
      onChange([...selectedSources, id]);
    }
  }

  const catLabel =
    activeCategory === "all"
      ? "전체"
      : CATEGORIES.find((c) => c.id === activeCategory)?.label ?? activeCategory;

  return (
    <div className="source-selector">
      <div className="source-selector-header">
        <span className="source-selector-title">뉴스 소스 선택</span>
        <span className="source-count">
          {catLabel} · {filtered.length}개 소스
        </span>
        <button className="toggle-all-btn" onClick={toggleAll}>
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>
      <div className="source-list">
        {filtered.map((source) => {
          const checked = selectedSources.includes(source.id);
          return (
            <label key={source.id} className={`source-item ${checked ? "checked" : ""}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(source.id)}
              />
              <span className="flag">{COUNTRY_FLAGS[source.country]}</span>
              <span className="source-name">{source.name}</span>
              <span className="source-desc">{source.description}</span>
              <div className="source-tags">
                {source.categories.map((c) => (
                  <span key={c} className="source-tag">
                    {CATEGORIES.find((x) => x.id === c)?.label}
                  </span>
                ))}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
