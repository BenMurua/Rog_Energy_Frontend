import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import useMultipleEnergyData from "../../hooks/useMultipleEnergyData";
import "./ApacheGraph.css";

// variables: array de strings
// unidades: array de strings (mismo orden que variables)
// titulo: string
export default function ApacheGraph({
  variables = [],
  unidades = [],
  tituloKey = "",
  apiKeys = [], // array de strings para identificar variables en la API
  tablas = [], // array de strings
  variablesApi = [], // array de strings
}) {
  const today = new Date();
  const defaultStart = today.toISOString().slice(0, 10);
  const defaultEnd = today.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [fullscreen, setFullscreen] = useState(false);

  // Preparar queries para el hook
  const queries = variables.map((v, idx) => ({
    key: v,
    tabla: tablas[idx],
    variable: variablesApi[idx],
  }));

  const { data, isLoading, error } = useMultipleEnergyData(
    queries,
    startDate,
    endDate,
  );

  // Extraer categorías (fechas) y series para ECharts
  let categories = [];
  let chartData = [];
  if (data && Object.keys(data).length > 0) {
    // Tomar las fechas de la primera variable
    const firstKey = variables[0];
    const firstSerie = data[firstKey] || [];
    categories = firstSerie.map(
      (item) => item.date + (item.hour ? " " + item.hour : ""),
    );
    chartData = variables.map((v) => ({
      name: v,
      data: (data[v] || []).map((item) => item.price),
    }));
  }

  const { t } = useTranslation();

  // Determinar unidad para el eje Y (toma la primera, asume todas iguales)
  const yUnit = unidades[0] || "";

  return (
    <div
      className={
        "apache-graph-container bordered" + (fullscreen ? " fullscreen" : "")
      }
      style={{
        background: fullscreen ? "#222a36" : "#f3f6fa",
        border: "1.5px solid #b3b3b3",
        borderRadius: 12,
        boxShadow: fullscreen ? "0 0 32px #222a36" : "0 2px 8px #d0d0d0",
      }}
    >
      <div className="apache-graph-header">
        <h2>{t(tituloKey)}</h2>
        <button
          className="fullscreen-btn"
          onClick={() => setFullscreen((f) => !f)}
        >
          {fullscreen ? "⤢" : "⤢"}
        </button>
      </div>
      <div className="date-selectors">
        <label>
          Fecha de inicio:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Fecha de fin:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div className="graph-placeholder">
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            Cargando datos...
          </div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", padding: 40 }}>
            {error}
          </div>
        ) : (
          <ReactECharts
            option={{
              tooltip: {
                trigger: "axis",
                backgroundColor: "#222",
                borderColor: "#888",
                textStyle: { color: "#fff" },
              },
              legend: {
                data: chartData.map((s) => s.name),
                bottom: -20,
                textStyle: { fontWeight: "bold" },
              },
              xAxis: {
                type: "category",
                data: categories,
                axisLine: { lineStyle: { color: "#888" } },
                axisLabel: { color: "#555" },
              },
              yAxis: {
                type: "value",
                name: yUnit,
                nameLocation: "end",
                nameTextStyle: {
                  fontWeight: "bold",
                  color: "#444",
                  fontSize: 16,
                  padding: [0, 0, 10, 0],
                },
                axisLine: { lineStyle: { color: "#888" } },
                axisLabel: { color: "#555" },
                splitLine: { lineStyle: { color: "#eee" } },
              },
              grid: { left: 40, right: 20, top: 40, bottom: 60 },
              color: ["#81affa", "#ffc17e", "#10b981", "#ef4444", "#a855f7"],
              series: chartData.map((s, idx) => ({
                name: s.name,
                type: "line",
                data: s.data,
                smooth: true,
                symbol: "circle",
                symbolSize: 8,
                lineStyle: { width: 3 },
                areaStyle: { opacity: 0.15 },
                emphasis: {
                  focus: "series",
                  itemStyle: { borderWidth: 2, borderColor: "#222" },
                },
              })),
            }}
            style={{
              height: fullscreen ? "80vh" : 300,
              width: fullscreen ? "100vw" : "100%",
            }}
          />
        )}
      </div>
    </div>
  );
}
