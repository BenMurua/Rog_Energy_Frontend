import React from "react";

export const DailyChartTooltip = ({
  active,
  payload,
  theme,
  palette,
  hasReal,
  data1Label,
  data2Label,
  extraWithData,
  getActionLabel,
}) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0].payload;
  const real = hasReal ? point.price2 : null;
  const predicted = point.price;
  const action = getActionLabel ? getActionLabel(point.hour) : "";

  return (
    <div
      style={{
        backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
        color: theme === "dark" ? "#f8fafc" : "#0b1625",
        border: `1px solid ${
          theme === "dark"
            ? "rgba(148, 163, 184, 0.35)"
            : "rgba(148, 163, 184, 0.6)"
        }`,
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow:
          theme === "dark"
            ? "0 12px 30px rgba(0,0,0,0.45)"
            : "0 12px 30px rgba(15,23,42,0.12)",
        minWidth: 180,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 700 }}>{point.hour}</span>
        <span style={{ fontWeight: 600 }}>{action}</span>
      </div>
      {real != null && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            marginBottom: 4,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="legend-square"
              style={{ background: palette.real }}
            />
            {data2Label}
          </span>
          <strong>{Number(real).toFixed(2)} €</strong>
        </div>
      )}
      {predicted != null && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            marginBottom: extraWithData.length ? 4 : 0,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="legend-square"
              style={{ background: palette.predicted }}
            />
            {data1Label}
          </span>
          <strong>{Number(predicted).toFixed(2)} €</strong>
        </div>
      )}
      {extraWithData.map((series) => {
        const value = point[series.key];
        if (!Number.isFinite(value)) return null;
        return (
          <div
            key={`tooltip-${series.key}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                className="legend-square"
                style={{ background: series.color }}
              />
              {series.label}
            </span>
            <strong>{Number(value).toFixed(2)} €</strong>
          </div>
        );
      })}
    </div>
  );
};
