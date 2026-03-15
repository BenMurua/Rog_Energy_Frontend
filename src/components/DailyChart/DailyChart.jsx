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
              ? { top: 15, right: 10, left: -15, bottom: 10 }
              : { top: 15, right: 30, left: 20, bottom: 10 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.8} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: isMobile ? 9 : 12, fill: "var(--text)", opacity: 0.8 }}
            interval={isMobile ? 7 : 2}
            stroke="var(--text)"
            strokeOpacity={0.4}
          />
          <YAxis
            domain={["auto", "auto"]}
            unit="€"
            tick={{ fontSize: isMobile ? 9 : 12, fill: "var(--text)", opacity: 0.8 }}
            width={isMobile ? 45 : 60}
            stroke="var(--text)"
            strokeOpacity={0.4}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--text)",
              borderRadius: "8px",
              boxShadow: "0 4px 20px var(--shadow)",
            }}
            itemStyle={{ color: "var(--text)" }}
          />
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: "20px" }} />

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
                fill="var(--price-up)"
                fillOpacity={0.15}
                label={{
                  value: chargeLabel,
                  position: "insideTop",
                  fill: "var(--price-up)",
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
                fill="var(--price-down)"
                fillOpacity={0.15}
                label={{
                  value: dischargeLabel,
                  position: "insideTop",
                  fill: "var(--price-down)",
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
                fill="var(--secondary)"
                fillOpacity={0.15}
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
                fill="var(--warning)"
                fillOpacity={0.15}
              />
            );
          })}

          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={false}
            name={data1Label}
            activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="price2"
            stroke="var(--secondary)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name={data2Label}
            activeDot={{ r: 6, fill: "var(--secondary)", stroke: "var(--background)", strokeWidth: 2 }}
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
                background: "var(--price-up)",
                opacity: 0.3,
                borderRadius: 4,
                display: "inline-block",
                border: "1px solid var(--price-up)"
              }}
            ></span>
            {chargeLabel}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "var(--price-down)",
                opacity: 0.3,
                borderRadius: 4,
                display: "inline-block",
                border: "1px solid var(--price-down)"
              }}
            ></span>
            {dischargeLabel}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                background: "var(--secondary)",
                opacity: 0.3,
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
                background: "var(--warning)",
                opacity: 0.3,
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
