import "./SubsectionNav.css";

export default function SubsectionNav({ items, activeKey, onChange }) {
  return (
    <div className="subsection-nav" role="tablist" aria-label="Subsecciones">
      {items.map((item) => (
        <button
          key={item.key}
          className={`subsection-tab ${activeKey === item.key ? "active" : ""}`}
          onClick={() => onChange(item.key)}
          role="tab"
          aria-selected={activeKey === item.key}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
