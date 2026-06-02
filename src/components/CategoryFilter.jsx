import { CATEGORIES } from "../data/sources";

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="category-filter">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={`cat-btn ${selected === cat.id ? "active" : ""}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
