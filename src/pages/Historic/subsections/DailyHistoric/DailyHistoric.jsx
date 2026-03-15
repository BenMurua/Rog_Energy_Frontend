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
import { generateHistoricDailyMockData } from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";

const today = new Date().toISOString().slice(0, 10);
const last7 = new Date();
last7.setDate(last7.getDate() - 6);

export default function DailyHistoric() {
  const [range, setRange] = useState({
    mode: "7d",
    start: last7.toISOString().slice(0, 10),
    end: today,
  });

  const data = useMemo(
    () => generateHistoricDailyMockData(range.start, range.end),
    [range],
  );

  const chartData = useMemo(
    () =>
      data.chartData.map((row, index) => {
        const realRow = data.chartDataReal[index];
        const merged = {
          hour: row.hour,
          averagePredicted: row.averagePredicted,
          averageReal: realRow.averageReal,
        };

        data.dates.forEach((date) => {
          merged[`${date}_pred`] = row[date];
          merged[`${date}_real`] = realRow[date];
        });

        return merged;
      }),
    [data],
  );

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Historico Mercado Diario (OMIE DA)</h3>
      </div>

      <QuickRangeSelector value={range} onChange={setRange} />

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" />
            <YAxis unit=" EUR" />
            <Tooltip />
            <Legend />
            {data.dates.map((date) => (
              <>
                <Line
                  key={`${date}-pred`}
                  type="monotone"
                  dataKey={`${date}_pred`}
                  stroke="var(--secondary)"
                  strokeOpacity={0.2}
                  strokeWidth={1.2}
                  dot={false}
                  name={`${date} pred`}
                />
                <Line
                  key={`${date}-real`}
                  type="monotone"
                  dataKey={`${date}_real`}
                  stroke="var(--primary)"
                  strokeOpacity={0.16}
                  strokeWidth={1.2}
                  strokeDasharray="5 4"
                  dot={false}
                  name={`${date} real`}
                />
              </>
            ))}
            <Line
              type="monotone"
              dataKey="averagePredicted"
              stroke="var(--secondary)"
              strokeWidth={2.8}
              dot={false}
              name="Media periodo predicha"
            />
            <Line
              type="monotone"
              dataKey="averageReal"
              stroke="var(--primary)"
              strokeWidth={2.8}
              strokeDasharray="7 4"
              dot={false}
              name="Media periodo real"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Min pred</th>
              <th>Max pred</th>
              <th>Media pred</th>
              <th>Horas neg pred</th>
              <th>Min real</th>
              <th>Max real</th>
              <th>Media real</th>
              <th>Horas neg real</th>
            </tr>
          </thead>
          <tbody>
            {data.summary.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.min.toFixed(2)}</td>
                <td>{row.max.toFixed(2)}</td>
                <td>{row.mean.toFixed(2)}</td>
                <td>{row.negativeHours}</td>
                <td>{row.minReal.toFixed(2)}</td>
                <td>{row.maxReal.toFixed(2)}</td>
                <td>{row.meanReal.toFixed(2)}</td>
                <td>{row.negativeHoursReal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
