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
import QuickRangeSelector from "../../../../components/QuickRangeSelector/QuickRangeSelector";
import {
  generateHistoricIntradayMockData,
  SESSION_IDS,
} from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";

const today = new Date().toISOString().slice(0, 10);
const last7 = new Date();
last7.setDate(last7.getDate() - 6);

export default function IntradayHistoric() {
  const [sessionId, setSessionId] = useState("ID1");
  const [range, setRange] = useState({
    mode: "7d",
    start: last7.toISOString().slice(0, 10),
    end: today,
  });

  const data = useMemo(
    () => generateHistoricIntradayMockData(range.start, range.end, sessionId),
    [range, sessionId],
  );

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Historico Intradiario (ID)</h3>
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

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" />
            <YAxis unit=" EUR" />
            <Tooltip />
            <Legend />
            {data.dates.map((date) => (
              <Line
                key={date}
                type="monotone"
                dataKey={date}
                stroke="var(--secondary)"
                strokeOpacity={0.2}
                strokeWidth={1.5}
                dot={false}
                name={date}
              />
            ))}
            <Line
              type="monotone"
              dataKey="average"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={false}
              name="Media periodo"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Sesion</th>
              <th>Precio min</th>
              <th>Precio max</th>
              <th>Precio medio</th>
              <th>Horas precio negativo</th>
            </tr>
          </thead>
          <tbody>
            {data.summary.map((row) => (
              <tr key={`${row.date}-${row.session}`}>
                <td>{row.date}</td>
                <td>{row.session}</td>
                <td>{row.min.toFixed(2)}</td>
                <td>{row.max.toFixed(2)}</td>
                <td>{row.mean.toFixed(2)}</td>
                <td>{row.negativeHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
