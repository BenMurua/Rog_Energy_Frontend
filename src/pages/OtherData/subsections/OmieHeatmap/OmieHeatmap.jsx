import { useMemo, useState } from "react";
import { generateOmieHeatmapMockData } from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";
import "./OmieHeatmap.css";

const getCellColor = (value, min, max) => {
  const ratio = (value - min) / Math.max(max - min, 1);
  const red = Math.floor(220 * ratio + 35);
  const green = Math.floor(190 - 130 * ratio);
  const blue = 50;
  return `rgb(${red}, ${green}, ${blue})`;
};

export default function OmieHeatmap() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [metric, setMetric] = useState("average");

  const [year, month] = selectedMonth.split("-").map(Number);
  const data = useMemo(
    () => generateOmieHeatmapMockData(year, month),
    [year, month],
  );

  const allValues = data.rows.flatMap((row) => row.hourlyValues);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Heatmap precio OMIE</h3>
        <div className="heatmap-controls">
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
          <div className="quick-range-buttons">
            <button
              type="button"
              className={`quick-range-button ${metric === "average" ? "active" : ""}`}
              onClick={() => setMetric("average")}
            >
              Media diaria
            </button>
            <button
              type="button"
              className={`quick-range-button ${metric === "max" ? "active" : ""}`}
              onClick={() => setMetric("max")}
            >
              Maximo diario
            </button>
          </div>
        </div>
      </div>

      <div className="heatmap-grid-wrapper">
        <div className="heatmap-grid">
          <div className="heatmap-row heatmap-header-row">
            <div className="heatmap-day-cell">Dia</div>
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={`hour-${hour}`} className="heatmap-hour-cell">
                {hour}
              </div>
            ))}
          </div>

          {data.rows.map((row) => {
            const reducedValue =
              metric === "average"
                ? row.hourlyValues.reduce((sum, value) => sum + value, 0) /
                  row.hourlyValues.length
                : Math.max(...row.hourlyValues);

            return (
              <div key={row.date} className="heatmap-row">
                <div className="heatmap-day-cell">{row.date.slice(-2)}</div>
                {row.hourlyValues.map((value, index) => {
                  const visualValue =
                    metric === "average"
                      ? (value + reducedValue) / 2
                      : Math.max(value, reducedValue);
                  return (
                    <div
                      key={`${row.date}-${index}`}
                      className="heatmap-cell"
                      style={{
                        backgroundColor: getCellColor(visualValue, min, max),
                      }}
                      title={`${row.date} ${index}:00 -> ${visualValue.toFixed(2)} EUR/MWh`}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Bajo ({min.toFixed(1)})</span>
        <div className="heatmap-gradient"></div>
        <span>Alto ({max.toFixed(1)})</span>
      </div>
    </div>
  );
}
