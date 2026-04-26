import React from "react";
import "./DailyChart.css";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { useDailyChartData } from "./useDailyChartData";
import { DailyChartTooltip } from "./DailyChartTooltip";

export default function DailyChart(props) {
  const {
    data,
    chargePeriod,
    dischargePeriod,
    optimalChargePeriod,
    optimalDischargePeriod,
    data2,
    data1Label = "Predicted Price",
    data2Label = "Real Price",
    chargeLabel = "Charge",
    dischargeLabel = "Discharge",
    showBandLegend = false,
    priceThresholds,
    showRealLine = true,
    showConfidenceBand = false,
    showThresholdLines = false,
    extraSeries,
    controls,
  } = props;

  const { t } = useTranslation();

  const {
    theme,
    palette,
    chargePeriods,
    dischargePeriods,
    optimalChargePeriods,
    optimalDischargePeriods,
    getIndex,
    chartData,
    hourlyTicks,
    getActionLabel,
    allThresholds,
    yDomain,
    hasPredicted,
    hasReal,
    hasCharge,
    hasDischarge,
    extraWithData,
  } = useDailyChartData({
    data,
    chargePeriod,
    dischargePeriod,
    optimalChargePeriod,
    optimalDischargePeriod,
    data2,
    priceThresholds,
    chargeLabel,
    dischargeLabel,
    showThresholdLines,
    showRealLine,
    extraSeries,
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <div className="chart-wrapper">
      {controls && <div className="chart-header-controls">{controls}</div>}
      <div className="chart-legend-row">
        {hasReal && (
          <div className="legend-item">
            <span
              className="legend-square"
              style={{ background: palette.real }}
            />
            <span>{data2Label}</span>
          </div>
        )}
        {hasPredicted && (
          <div className="legend-item">
            <span
              className="legend-square"
              style={{
                background:
                  "repeating-linear-gradient(90deg, " +
                  `${palette.predicted} 0, ${palette.predicted} 6px, transparent 6px, transparent 12px)`,
                border: `1px solid ${palette.predicted}`,
              }}
            />
            <span>{data1Label}</span>
          </div>
        )}
        {showConfidenceBand && hasPredicted && (
          <div className="legend-item">
            <span
              className="legend-square"
              style={{ background: palette.band, opacity: 0.12 }}
            />
            <span>{t("prediction.confidence_band", "Banda de confianza")}</span>
          </div>
        )}
        {hasCharge && (
          <div className="legend-item">
            <span
              className="legend-square"
              style={{
                background: palette.chargeFill,
                borderColor: "transparent",
              }}
            />
            <span>{chargeLabel}</span>
          </div>
        )}
        {hasDischarge && (
          <div className="legend-item">
            <span
              className="legend-square"
              style={{
                background: palette.dischargeFill,
                borderColor: "transparent",
              }}
            />
            <span>{dischargeLabel}</span>
          </div>
        )}
        {extraWithData
          .filter((series) => series.showInLegend)
          .map((series) => (
            <div key={`legend-${series.key}`} className="legend-item">
              <span
                className="legend-square"
                style={{
                  background: series.strokeDasharray
                    ? `repeating-linear-gradient(90deg, ${series.color} 0, ${series.color} 6px, transparent 6px, transparent 12px)`
                    : series.color,
                  border: `1px solid ${series.color}`,
                }}
              />
              <span>{series.label}</span>
            </div>
          ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={
            isMobile
              ? { top: 10, right: 12, left: 0, bottom: 8 }
              : { top: 10, right: 24, left: 4, bottom: 10 }
          }
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.4}
            verticalFill={[]}
            horizontalFill={[]}
          />
          <XAxis
            dataKey="hour"
            tick={{
              fontSize: isMobile ? 9 : 12,
              fill: "var(--text)",
              opacity: 0.8,
            }}
            ticks={hourlyTicks}
            tickCount={7}
            interval={0}
            stroke="var(--text)"
            strokeOpacity={0.4}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            unit="€"
            tick={{
              fontSize: isMobile ? 9 : 12,
              fill: "var(--text)",
              opacity: 0.8,
            }}
            width={isMobile ? 45 : 60}
            stroke="var(--text)"
            strokeOpacity={0.4}
            axisLine={false}
            tickLine={false}
            allowDecimals
            tickFormatter={(value) =>
              Number.isFinite(value) ? value.toFixed(2) : value
            }
          />
          <Tooltip
            content={
              <DailyChartTooltip
                theme={theme}
                palette={palette}
                hasReal={hasReal}
                data1Label={data1Label}
                data2Label={data2Label}
                extraWithData={extraWithData}
                getActionLabel={getActionLabel}
              />
            }
          />

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
                fill={palette.chargeFill}
                label={
                  idx === 0
                    ? {
                        value: chargeLabel,
                        position: "insideTop",
                        fill: palette.labelOnBand,
                        fontWeight: "bold",
                        style: { opacity: 0.95 },
                      }
                    : undefined
                }
              />
            );
          })}

          {/* Franjas rojas para descarga */}
          {dischargePeriods.map((period, idx) => {
            if (period.start === "00:00") return null;
            const x1 = getIndex(period.start);
            const x2 = getIndex(period.end) + 1;
            if (x1 === -1 || x2 === 0) return null;
            return (
              <ReferenceArea
                key={`discharge-${idx}`}
                x1={x1}
                x2={x2}
                fill={palette.dischargeFill}
                label={
                  idx === 0
                    ? {
                        value: dischargeLabel,
                        position: "insideTop",
                        fill: palette.labelOnBand,
                        fontWeight: "bold",
                        style: { opacity: 0.95 },
                      }
                    : undefined
                }
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

          {showThresholdLines &&
            allThresholds.map((item, idx) => (
              <ReferenceLine
                key={`threshold-${idx}`}
                y={item.value}
                stroke={item.color}
                strokeDasharray="6 6"
                strokeOpacity={0.8}
                label={{
                  position: "right",
                  value: `${item.label}: ${item.value} €`,
                  fill: item.color,
                  fontSize: 11,
                }}
              />
            ))}

          {showConfidenceBand && (
            <>
              <Area
                type="monotone"
                dataKey="predictedUpper"
                stroke="none"
                fill={palette.band}
                fillOpacity={0.1}
                connectNulls
                baseLine={(entry) => entry.predictedLower}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="predictedLower"
                stroke="none"
                fill={palette.band}
                fillOpacity={0.06}
                connectNulls
                isAnimationActive={false}
              />
            </>
          )}

          {showRealLine && (
            <Line
              type="monotone"
              dataKey="price2"
              stroke={palette.real}
              strokeWidth={2.5}
              dot={false}
              name={data2Label}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="price"
            stroke={palette.predicted}
            strokeWidth={1.8}
            strokeDasharray="6 4"
            dot={false}
            name={data1Label}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          {extraWithData.map((series) => (
            <Line
              key={`line-${series.key}`}
              type="monotone"
              dataKey={series.key}
              stroke={series.color}
              strokeWidth={series.strokeWidth}
              strokeDasharray={series.strokeDasharray}
              dot={series.dot}
              name={series.label}
              connectNulls
              activeDot={series.activeDot}
            />
          ))}
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
                border: "1px solid var(--price-up)",
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
                border: "1px solid var(--price-down)",
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
            {chargeLabel}
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
            {dischargeLabel}
          </span>
        </div>
      )}
    </div>
  );
}
