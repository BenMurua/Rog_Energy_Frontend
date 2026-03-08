// src/components/DailyChart/DailyChart.js

import React from "react";
import "./DailyChart.css";
import { useTranslation } from "react-i18next";
import { extractPeriods } from "../../utils/chartUtils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from "recharts";

export default function DailyChart({
  data,
  chargePeriod,
  dischargePeriod,
  optimalChargePeriod = [],
  optimalDischargePeriod = [],
  data2,
  data1Label = "Predicted Price",
  data2Label = "Real Price",
  chargeLabel = "Charge",
  dischargeLabel = "Discharge",
  optimalChargeLabel = "Optimal Charge",
  optimalDischargeLabel = "Optimal Discharge",
  showBandLegend = false,
}) {
  const { t } = useTranslation();

  // Extraer periodos de carga y descarga desde los arrays
  const chargePeriods = extractPeriods(chargePeriod);
  const dischargePeriods = extractPeriods(dischargePeriod);
  const optimalChargePeriods = extractPeriods(optimalChargePeriod);
  const optimalDischargePeriods = extractPeriods(optimalDischargePeriod);

  // Función para obtener índice en el array de datos
  const getIndex = (hour) => data.findIndex((d) => d.hour === hour);

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

  // Detectar si es móvil para ajustar márgenes
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

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
          data={data.map((d, i) => ({
            ...d,
            price2: data2 && data2[i] ? data2[i].price : null,
          }))}
          margin={
            isMobile
              ? { top: 5, right: 10, left: -15, bottom: 5 }
              : { top: 5, right: 30, left: 20, bottom: 5 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: isMobile ? 9 : 12 }}
            interval={isMobile ? 7 : 2}
          />
          <YAxis
            domain={["auto", "auto"]}
            unit="€"
            tick={{ fontSize: isMobile ? 9 : 12 }}
            width={isMobile ? 45 : 60}
          />
          <Tooltip />
          <Legend />

          {/* Franjas verdes para carga */}
          {chargePeriods.map((period, idx) => {
            const x1 = getIndex(period.start);
            const x2 = getIndex(period.end) + 1;
            if (x1 === -1 || x2 === 0) return null;
            return (
              <ReferenceArea
                key={`charge-${idx}`}
                x1={x1}
                x2={x2}
                fill="#4CAF50"
                fillOpacity={0.3}
                label={{
                  value: chargeLabel,
                  position: "insideTop",
                  fill: "#4CAF50",
                  fontWeight: "bold",
                }}
              />
            );
          })}

          {/* Franjas rojas para descarga */}
          {dischargePeriods.map((period, idx) => {
            if (period.start === "00:00") return null; // Skip periods starting at 00:00
            const x1 = getIndex(period.start);
            const x2 = getIndex(period.end) + 1;
            if (x1 === -1 || x2 === 0) return null;
            return (
              <ReferenceArea
                key={`discharge-${idx}`}
                x1={x1}
                x2={x2}
                fill="#F44336"
                fillOpacity={0.3}
                label={{
                  value: dischargeLabel,
                  position: "insideTop",
                  fill: "#F44336",
                  fontWeight: "bold",
                }}
              />
            );
          })}

          {/* Franjas azules para optimal charge */}
          {optimalChargePeriods.map((period, idx) => {
            const x1 = getIndex(period.start);
            const x2 = getIndex(period.end) + 1;
            if (x1 === -1 || x2 === 0) return null;
            return (
              <ReferenceArea
                key={`optimal-charge-${idx}`}
                x1={x1}
                x2={x2}
                fill="#2196F3"
                fillOpacity={0.2}
              />
            );
          })}

          {/* Franjas naranjas para optimal discharge */}
          {optimalDischargePeriods.map((period, idx) => {
            const x1 = getIndex(period.start);
            const x2 = getIndex(period.end) + 1;
            if (x1 === -1 || x2 === 0) return null;
            return (
              <ReferenceArea
                key={`optimal-discharge-${idx}`}
                x1={x1}
                x2={x2}
                fill="#FF9800"
                fillOpacity={0.2}
              />
            );
          })}

          <Line
            type="monotone"
            dataKey="price"
            stroke="#2196F3"
            strokeWidth={2}
            dot={false}
            name={data1Label}
          />
          <Line
            type="monotone"
            dataKey="price2"
            stroke="#FF9800"
            strokeWidth={2}
            dot={false}
            name={data2Label}
          />
        </LineChart>
      </ResponsiveContainer>
      {showBandLegend && (
        <div
          className="band-legend"
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "#4CAF50",
                opacity: 0.3,
                borderRadius: 4,
                display: "inline-block",
              }}
            ></span>
            {chargeLabel}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "#F44336",
                opacity: 0.3,
                borderRadius: 4,
                display: "inline-block",
              }}
            ></span>
            {dischargeLabel}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "#2196F3",
                opacity: 0.2,
                borderRadius: 4,
                display: "inline-block",
              }}
            ></span>
            {optimalChargeLabel}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "#FF9800",
                opacity: 0.2,
                borderRadius: 4,
                display: "inline-block",
              }}
            ></span>
            {optimalDischargeLabel}
          </span>
        </div>
      )}
    </div>
  );
}
