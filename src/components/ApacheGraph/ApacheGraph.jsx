import React, { useState } from "react";
import { createPortal } from "react-dom";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import useMultipleEnergyData from "../../hooks/useMultipleEnergyData";
import "./ApacheGraph.css";

const CHART_COLORS = ["#0066ff", "#00d4aa", "#7c3aed", "#f59e0b", "#ef4444"];

function buildChartOption({ categories, chartData, yUnit, stacked = false }) {
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10,20,40,0.95)",
      borderColor: "rgba(0,102,255,0.4)",
      borderWidth: 1,
      textStyle: { color: "#e2e8f0", fontSize: 13 },
      axisPointer: {
        type: "cross",
        lineStyle: { color: "rgba(0,102,255,0.4)", width: 1.5 },
        crossStyle: { color: "rgba(0,102,255,0.4)" },
      },
      formatter: (params) => {
        let html = `<div style="font-weight:700;color:#00d4aa;margin-bottom:6px;letter-spacing:0.04em">${params[0]?.axisValue || ""}</div>`;
        params.forEach((p) => {
          html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 4px ${p.color}"></span>
            <span style="color:#94a3b8">${p.seriesName}:</span>
            <span style="font-weight:700;color:#fff;margin-left:auto;padding-left:12px">${p.value !== null && p.value !== undefined ? Number(p.value).toFixed(2) : "—"} ${yUnit}</span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      data: chartData.map((s) => s.name),
      top: 6,
      left: "center",
      textStyle: { color: "#94a3b8", fontWeight: "600", fontSize: 11 },
      itemWidth: 18,
      itemHeight: 3,
      icon: "rect",
    },
    toolbox: {
      right: 12,
      top: 4,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
          title: { zoom: "Zoom", back: "Reset" },
        },
        restore: { title: "Reset" },
        saveAsImage: { title: "Save" },
      },
      iconStyle: {
        borderColor: "#0066ff",
        color: "rgba(0,102,255,0.15)",
      },
      emphasis: {
        iconStyle: { borderColor: "#00d4aa", color: "rgba(0,212,170,0.2)" },
      },
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      {
        type: "slider",
        start: 0,
        end: 100,
        height: 18,
        bottom: 4,
        borderColor: "rgba(0,102,255,0.2)",
        fillerColor: "rgba(0,102,255,0.15)",
        handleStyle: { color: "#0066ff", borderColor: "#0066ff" },
        moveHandleStyle: { color: "#0066ff" },
        textStyle: { color: "#64748b", fontSize: 10 },
        dataBackground: {
          lineStyle: { color: "#0066ff44" },
          areaStyle: { color: "#0066ff11" },
        },
        selectedDataBackground: {
          lineStyle: { color: "#0066ff" },
          areaStyle: { color: "#0066ff33" },
        },
      },
    ],
    xAxis: {
      type: "category",
      data: categories,
      axisLine: { lineStyle: { color: "#334155" } },
      axisTick: { lineStyle: { color: "#334155" } },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
        rotate: categories.length > 24 ? 30 : 0,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      name: yUnit,
      nameLocation: "end",
      nameTextStyle: {
        fontWeight: "700",
        color: "#00d4aa",
        fontSize: 12,
        padding: [0, 0, 8, 0],
      },
      axisLine: { show: true, lineStyle: { color: "#334155" } },
      axisTick: { show: true, lineStyle: { color: "#334155" } },
      axisLabel: { color: "#64748b", fontSize: 11 },
      splitLine: { lineStyle: { color: "rgba(51,65,85,0.5)", type: "dashed" } },
    },
    grid: { left: 55, right: 20, top: 46, bottom: 38 },
    color: CHART_COLORS,
    series: chartData.map((s, idx) => ({
      name: s.name,
      type: "line",
      data: s.data,
      smooth: 0.4,
      symbol: "circle",
      symbolSize: stacked ? 3 : 5,
      ...(stacked ? { stack: "total" } : {}),
      lineStyle: {
        width: stacked ? 1.5 : 2.5,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      },
      itemStyle: { color: CHART_COLORS[idx % CHART_COLORS.length] },
      areaStyle: stacked
        ? {
            color: CHART_COLORS[idx % CHART_COLORS.length] + "cc",
            opacity: 0.75,
          }
        : {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: CHART_COLORS[idx % CHART_COLORS.length] + "44",
                },
                {
                  offset: 1,
                  color: CHART_COLORS[idx % CHART_COLORS.length] + "00",
                },
              ],
            },
          },
      emphasis: {
        focus: "series",
        lineStyle: { width: 3.5 },
        itemStyle: {
          borderWidth: 2,
          borderColor: "#fff",
          shadowBlur: 8,
          shadowColor: CHART_COLORS[idx % CHART_COLORS.length],
        },
      },
    })),
  };
}

export default function ApacheGraph({
  variables = [],
  unidades = [],
  tituloKey = "",
  apiKeys = [],
  tablas = [],
  variablesApi = [],
  defaultStartDaysAgo = 0,
  stacked = false,
}) {
  const today = new Date();
  const defaultEnd = today.toISOString().slice(0, 10);
  const startD = new Date(today);
  startD.setDate(startD.getDate() - defaultStartDaysAgo);
  const defaultStart = startD.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [fullscreen, setFullscreen] = useState(false);

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

  let categories = [];
  let chartData = [];
  if (data && Object.keys(data).length > 0) {
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
  const yUnit = unidades[0] || "";
  const chartOption = buildChartOption({
    categories,
    chartData,
    yUnit,
    stacked,
  });

  const renderChart = (height) =>
    isLoading ? (
      <div className="ag-state-msg">
        <span className="ag-spinner" />
        Cargando datos...
      </div>
    ) : error ? (
      <div className="ag-state-msg ag-state-error">{error}</div>
    ) : (
      <ReactECharts
        option={chartOption}
        style={{ height, width: "100%" }}
        notMerge
        lazyUpdate
      />
    );

  return (
    <>
      <div className="apache-graph-container">
        <div className="apache-graph-header">
          <div className="ag-title-row">
            <span className="ag-indicator" />
            <h2>{t(tituloKey)}</h2>
          </div>
          <button
            className="fullscreen-btn"
            onClick={() => setFullscreen(true)}
            title="Ampliar gráfica"
            aria-label="Ampliar gráfica"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            <span>Ampliar</span>
          </button>
        </div>
        <div className="date-selectors">
          <label>
            <span className="date-label-text">Inicio</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            <span className="date-label-text">Fin</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>
        <div className="graph-placeholder">{renderChart(320)}</div>
      </div>

      {fullscreen &&
        createPortal(
          <div
            className="ag-fullscreen-overlay"
            onClick={(e) =>
              e.target === e.currentTarget && setFullscreen(false)
            }
          >
            <div className="ag-fullscreen-wrapper">
              <div className="ag-fullscreen-header">
                <div className="ag-title-row">
                  <span className="ag-indicator" />
                  <h2>{t(tituloKey)}</h2>
                </div>
                <button
                  className="ag-close-btn"
                  onClick={() => setFullscreen(false)}
                  aria-label="Cerrar"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="ag-fullscreen-dates">
                <label>
                  <span className="date-label-text">Inicio</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                <label>
                  <span className="date-label-text">Fin</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
              </div>
              <div className="ag-fullscreen-chart">
                {renderChart("calc(100vh - 180px)")}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
