import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import QuickRangeSelector from "../../../../components/QuickRangeSelector/QuickRangeSelector";
import { generateStatisticsDailyMockData } from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";

const today = new Date().toISOString().slice(0, 10);
const last30 = new Date();
last30.setDate(last30.getDate() - 29);

export default function DailyStatistics() {
  const [range, setRange] = useState({
    mode: "30d",
    start: last30.toISOString().slice(0, 10),
    end: today,
  });

  const stats = useMemo(
    () => generateStatisticsDailyMockData(range.start, range.end),
    [range],
  );

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Estadisticas Mercado Diario (DA)</h3>
      </div>

      <QuickRangeSelector value={range} onChange={setRange} />

      <div className="kpi-grid">
        <article className="kpi-card">
          <span className="kpi-label">Precio medio</span>
          <strong className="kpi-value">
            {stats.kpis.averagePrice.toFixed(2)} EUR/MWh
          </strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-label">Precio maximo</span>
          <strong className="kpi-value">
            {stats.kpis.maxPrice.toFixed(2)} EUR/MWh
          </strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-label">Precio minimo</span>
          <strong className="kpi-value">
            {stats.kpis.minPrice.toFixed(2)} EUR/MWh
          </strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-label">% horas precio negativo</span>
          <strong className="kpi-value">
            {stats.kpis.negativeRate.toFixed(2)}%
          </strong>
        </article>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.histogram}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" angle={-25} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="var(--secondary)" name="Frecuencia" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.monthlyRanges}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" />
            <YAxis unit=" EUR" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="min"
              stroke="var(--price-up)"
              name="Minimo"
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="var(--primary)"
              name="Media"
              strokeWidth={2.5}
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke="var(--price-down)"
              name="Maximo"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
