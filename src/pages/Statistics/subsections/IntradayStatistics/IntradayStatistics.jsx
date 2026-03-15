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
import {
  generateStatisticsIntradayMockData,
  SESSION_IDS,
} from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";

const today = new Date().toISOString().slice(0, 10);
const last30 = new Date();
last30.setDate(last30.getDate() - 29);

export default function IntradayStatistics() {
  const [sessionId, setSessionId] = useState("ID1");
  const [range, setRange] = useState({
    mode: "30d",
    start: last30.toISOString().slice(0, 10),
    end: today,
  });

  const stats = useMemo(
    () => generateStatisticsIntradayMockData(range.start, range.end, sessionId),
    [range, sessionId],
  );

  const comparisonChart = useMemo(() => {
    return stats.comparisonSeries[0].values.map((point, index) => {
      const row = { hour: point.hour };
      stats.comparisonSeries.forEach((series) => {
        row[series.session] = series.values[index].price;
      });
      return row;
    });
  }, [stats]);

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Estadisticas Intradiario (ID)</h3>
        <div className="quick-range-buttons">
          {SESSION_IDS.map((session) => (
            <button
              key={session}
              type="button"
              className={`quick-range-button ${session === sessionId ? "active" : ""}`}
              onClick={() => setSessionId(session)}
            >
              {session}
            </button>
          ))}
        </div>
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
        <ResponsiveContainer width="100%" height={280}>
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
        <ResponsiveContainer width="100%" height={280}>
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

      <div className="chart-shell">
        <h4 className="section-title" style={{ marginBottom: 10 }}>
          Comparacion de sesiones para {stats.comparisonDate}
        </h4>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={comparisonChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" />
            <YAxis unit=" EUR" />
            <Tooltip />
            <Legend />
            {SESSION_IDS.map((session, index) => (
              <Line
                key={session}
                type="monotone"
                dataKey={session}
                stroke={`var(--chart-${index + 1})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
