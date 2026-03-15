import { useMemo } from "react";
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
import { generateMibelFuturesMockData } from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";

export default function MibelFutures() {
  const data = useMemo(() => generateMibelFuturesMockData(), []);

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Futuros MIBEL</h3>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" />
            <YAxis unit=" EUR" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="M+1"
              stroke="var(--chart-1)"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Q+1"
              stroke="var(--chart-2)"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Y+1"
              stroke="var(--chart-3)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Precio actual</th>
              <th>Variacion dia</th>
              <th>Variacion semana</th>
              <th>Fecha vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {data.table.map((row) => (
              <tr key={row.contract}>
                <td>{row.contract}</td>
                <td>{row.currentPrice.toFixed(2)} EUR</td>
                <td>{row.dayVariation.toFixed(2)} EUR</td>
                <td>{row.weekVariation.toFixed(2)} EUR</td>
                <td>{row.expiryDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
