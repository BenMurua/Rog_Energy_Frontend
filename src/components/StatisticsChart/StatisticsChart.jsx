// src/components/StatisticsChart/StatisticsChart.jsx

import React from "react";
import "./StatisticsChart.css";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StatisticsChart({
  data,
  data2,
  data1Label = "Ideal Return",
  data2Label = "Model Prediction Return",
}) {
  const { t } = useTranslation();

  // Merge data and data2 into a single array for the chart
  const mergedData = data
    ? data.map((item, index) => ({
        ...item,
        price2: data2 && data2[index] ? data2[index].price : null,
      }))
    : [];

  // Detectar si es móvil para ajustar márgenes
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  // Altura responsiva según el ancho de pantalla
  const getChartHeight = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 480
        ? 220
        : window.innerWidth <= 768
          ? 280
          : 500;
    }
    return 500;
  };

  const maxLabels = isMobile ? 3 : 10;
  const interval =
    mergedData.length > maxLabels
      ? Math.floor(mergedData.length / maxLabels)
      : 0;

  const [chartHeight, setChartHeight] = React.useState(getChartHeight());

  React.useEffect(() => {
    const handleResize = () => setChartHeight(getChartHeight());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={mergedData}
          margin={
            isMobile
              ? { top: 5, right: 10, left: -15, bottom: 5 }
              : { top: 5, right: 30, left: 20, bottom: 5 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            interval={interval}
            tick={{ fontSize: isMobile ? 8 : 12 }}
          />
          <YAxis
            tick={{ fontSize: isMobile ? 8 : 12 }}
            width={isMobile ? 45 : 60}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            name={data1Label}
            strokeWidth={2}
          />
          {data2 && data2.length > 0 && (
            <Line
              type="monotone"
              dataKey="price2"
              stroke="#82ca9d"
              name={data2Label}
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
