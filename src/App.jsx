import { useState } from "react";
import CategoryFilter from "./components/CategoryFilter";
import SourceSelector from "./components/SourceSelector";
import ArticleFeed from "./components/ArticleFeed";
import { SOURCES } from "./data/sources";
import "./App.css";

const DEFAULT_SOURCES = SOURCES.map((s) => s.id);

export default function App() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSources, setSelectedSources] = useState(DEFAULT_SOURCES);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">⚕</span>
            <h1 className="brand-title">MedicalNews Hub</h1>
            <span className="brand-sub">의학·제약 뉴스 통합 플랫폼</span>
          </div>
          <div className="header-search">
            <input
              className="search-input"
              type="search"
              placeholder="기사 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "소스 패널 닫기" : "소스 패널 열기"}
          >
            {sidebarOpen ? "◀ 소스" : "▶ 소스"}
          </button>
        </div>
        <CategoryFilter selected={activeCategory} onChange={setActiveCategory} />
      </header>

      <div className={`layout ${sidebarOpen ? "with-sidebar" : ""}`}>
        {sidebarOpen && (
          <aside className="sidebar">
            <SourceSelector
              selectedSources={selectedSources}
              onChange={setSelectedSources}
              activeCategory={activeCategory}
            />
          </aside>
        )}
        <main className="main">
          <ArticleFeed
            selectedSources={selectedSources}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
          />
        </main>
      </div>
    </div>
  );
}
