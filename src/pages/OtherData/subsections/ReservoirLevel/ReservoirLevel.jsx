import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateReservoirLevelMockData } from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";

const RANGES = [
  { key: "6m", label: "Ultimos 6 meses" },
  { key: "1y", label: "Ultimo ano" },
  { key: "2y", label: "Ultimos 2 anos" },
];

export default function ReservoirLevel() {
  const [range, setRange] = useState("1y");
  const data = useMemo(() => generateReservoirLevelMockData(range), [range]);

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Nivel de embalses</h3>
        <div className="quick-range-buttons">
          {RANGES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`quick-range-button ${range === item.key ? "active" : ""}`}
              onClick={() => setRange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span className="kpi-label">Nivel actual</span>
          <strong className="kpi-value">
            {data.kpis.currentLevel.toFixed(2)} GWh
          </strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-label">Diferencia vs media historica</span>
          <strong className="kpi-value">
            {data.kpis.diffVsAverage.toFixed(2)}%
          </strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-label">
            Diferencia vs mismo periodo ano anterior
          </span>
          <strong className="kpi-value">
            {data.kpis.diffVsLastYear.toFixed(2)}%
          </strong>
        </article>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={330}>
          <AreaChart data={data.series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" />
            <YAxis unit=" GWh" />
            <Tooltip />
            <Legend />
            <ReferenceLine
              y={data.kpis.mean}
              stroke="var(--warning)"
              strokeDasharray="5 5"
              label="Media historica"
            />
            <Area
              type="monotone"
              dataKey="level"
              fill="var(--primary)"
              stroke="var(--primary)"
              fillOpacity={0.35}
              name="Nivel embalsado"
            />
            <Line
              type="monotone"
              dataKey="historicalAverage"
              stroke="var(--secondary)"
              dot={false}
              name="Media semanal"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
