import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateConsumptionForecastVsRealMockData } from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";

export default function ConsumptionForecastVsReal() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const data = useMemo(
    () => generateConsumptionForecastVsRealMockData(selectedDate),
    [selectedDate],
  );

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Consumo previsto vs real</h3>
        <label>
          Fecha
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span className="kpi-label">MAE</span>
          <strong className="kpi-value">{data.mae.toFixed(2)} MW</strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-label">MAPE</span>
          <strong className="kpi-value">{data.mape.toFixed(2)}%</strong>
        </article>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data.series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" />
            <YAxis unit=" MW" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="var(--secondary)"
              strokeDasharray="6 6"
              dot={false}
              name="Consumo previsto"
            />
            <Line
              type="monotone"
              dataKey="real"
              stroke="var(--primary)"
              dot={false}
              name="Consumo real"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
