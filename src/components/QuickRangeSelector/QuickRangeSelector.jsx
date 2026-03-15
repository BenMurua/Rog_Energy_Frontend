import { useMemo, useState } from "react";
import "./QuickRangeSelector.css";

const QUICK_RANGES = [
  { key: "7d", label: "7 dias", days: 7 },
  { key: "30d", label: "30 dias", days: 30 },
  { key: "90d", label: "90 dias", days: 90 },
  { key: "custom", label: "Personalizado", days: null },
];

const toDateInput = (date) => date.toISOString().slice(0, 10);

export default function QuickRangeSelector({ value, onChange }) {
  const [customStart, setCustomStart] = useState(value.start);
  const [customEnd, setCustomEnd] = useState(value.end);

  const maxDate = useMemo(() => toDateInput(new Date()), []);

  const applyQuickRange = (rangeKey) => {
    if (rangeKey === "custom") {
      onChange({
        ...value,
        mode: "custom",
        start: customStart,
        end: customEnd,
      });
      return;
    }

    const selected = QUICK_RANGES.find((item) => item.key === rangeKey);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (selected.days - 1));

    onChange({
      mode: rangeKey,
      start: toDateInput(start),
      end: toDateInput(end),
    });
  };

  const onApplyCustom = () => {
    onChange({
      mode: "custom",
      start: customStart,
      end: customEnd,
    });
  };

  return (
    <div className="quick-range-selector">
      <div className="quick-range-buttons">
        {QUICK_RANGES.map((range) => (
          <button
            key={range.key}
            type="button"
            className={`quick-range-button ${value.mode === range.key ? "active" : ""}`}
            onClick={() => applyQuickRange(range.key)}
          >
            {range.label}
          </button>
        ))}
      </div>

      {value.mode === "custom" && (
        <div className="quick-range-custom">
          <label>
            Desde
            <input
              type="date"
              value={customStart}
              max={maxDate}
              onChange={(event) => setCustomStart(event.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              value={customEnd}
              max={maxDate}
              onChange={(event) => setCustomEnd(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="apply-custom"
            onClick={onApplyCustom}
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
