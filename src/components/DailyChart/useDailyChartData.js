import React from "react";
import { useTheme } from "../../context/themeContext";
import { extractPeriods } from "../../utils/chartUtils";
import { useTranslation } from "react-i18next";

export function useDailyChartData({
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
}) {
  const { t } = useTranslation();
  const { theme = "light" } = useTheme() || {};

  const palette = React.useMemo(
    () =>
      theme === "dark"
        ? {
            predicted: "#B794F4",
            real: "#60A5FA",
            band: "#B794F4",
            chargeFill: "rgba(52, 211, 153, 0.32)",
            dischargeFill: "rgba(248, 113, 113, 0.32)",
            labelOnBand: "#ffffff",
            labelText: "#ffffff",
            extras: ["#FBBF24", "#22D3EE", "#34D399", "#F472B6"],
          }
        : {
            predicted: "#9F7AEA",
            real: "#3B8BD4",
            band: "#9F7AEA",
            chargeFill: "rgba(34, 197, 94, 0.26)",
            dischargeFill: "rgba(244, 63, 94, 0.26)",
            labelOnBand: "#000000",
            labelText: "#0b1625",
            extras: ["#F59E0B", "#0EA5E9", "#10B981", "#EC4899"],
          },
    [theme],
  );

  const resolvedExtraSeries = React.useMemo(
    () =>
      (extraSeries || []).map((series, index) => ({
        key: series.key || `extra-${index}`,
        label:
          series.label ||
          series.key ||
          t("prediction.extra_series", "Serie adicional"),
        data: Array.isArray(series.data) ? series.data : [],
        color: series.color || palette.extras[index % palette.extras.length],
        strokeWidth: series.strokeWidth ?? 2,
        strokeDasharray: series.strokeDasharray || "",
        dot: series.dot ?? false,
        activeDot: series.activeDot ?? { r: 4, strokeWidth: 0 },
        showInLegend: series.showInLegend !== false,
      })),
    [extraSeries, palette.extras, t],
  );

  const chargePeriods = extractPeriods(chargePeriod);
  const dischargePeriods = extractPeriods(dischargePeriod);
  const optimalChargePeriods = extractPeriods(optimalChargePeriod);
  const optimalDischargePeriods = extractPeriods(optimalDischargePeriod);

  const getIndex = React.useCallback(
    (hour) => data.findIndex((d) => d.hour === hour),
    [data],
  );

  const chartData = React.useMemo(() => {
    const fallbackBand = (priceValue) =>
      Number.isFinite(priceValue) ? Math.max(priceValue * 0.05, 1.5) : null;

    return data.map((d, i) => {
      const predicted = Number.isFinite(d.price) ? d.price : null;
      const real = data2 && data2[i] ? data2[i].price : null;
      const upper =
        d.predictedUpper ??
        d.upper ??
        (predicted != null ? predicted + fallbackBand(predicted) : null);
      const lower =
        d.predictedLower ??
        d.lower ??
        (predicted != null ? predicted - fallbackBand(predicted) : null);

      const extrasValues = resolvedExtraSeries.reduce((acc, series) => {
        const value = series.data[i];
        const numericValue =
          value && typeof value === "object"
            ? (value.price ?? value.value)
            : value;
        acc[series.key] = Number.isFinite(numericValue) ? numericValue : null;
        return acc;
      }, {});

      return {
        ...d,
        price: predicted,
        price2: real,
        predictedUpper: upper,
        predictedLower: lower,
        ...extrasValues,
      };
    });
  }, [data, data2, resolvedExtraSeries]);

  const hourlyTicks = React.useMemo(() => {
    const ticks = chartData
      .filter(
        (point) => typeof point.hour === "string" && point.hour.endsWith(":00"),
      )
      .map((point) => point.hour);
    return ticks.length ? ticks : ["00:00", "06:00", "12:00", "18:00", "23:59"];
  }, [chartData]);

  const getActionLabel = React.useCallback(
    (hour) => {
      const hourIndex = getIndex(hour);

      const inPeriod = (periods) =>
        periods.some((period) => {
          const start = getIndex(period.start);
          const end = getIndex(period.end);
          return (
            start !== -1 && end !== -1 && hourIndex >= start && hourIndex <= end
          );
        });

      if (inPeriod(chargePeriods)) return "⬇ Cargar";
      if (inPeriod(dischargePeriods)) return "⬆ Descargar";
      return "— Standby";
    },
    [getIndex, chargePeriods, dischargePeriods],
  );

  const collectPricesForPeriods = React.useCallback(
    (periods) => {
      const values = [];
      periods.forEach((period) => {
        const start = getIndex(period.start);
        const end = getIndex(period.end);
        if (start !== -1 && end !== -1) {
          for (let idx = start; idx <= end; idx += 1) {
            const priceValue = chartData[idx]?.price;
            if (Number.isFinite(priceValue)) values.push(priceValue);
          }
        }
      });
      return values;
    },
    [getIndex, chartData],
  );

  const chargeThresholdValue = React.useMemo(() => {
    const values = collectPricesForPeriods(chargePeriods);
    if (!values.length) return null;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Number((sum / values.length).toFixed(2));
  }, [chargePeriods, collectPricesForPeriods]);

  const dischargeThresholdValue = React.useMemo(() => {
    const values = collectPricesForPeriods(dischargePeriods);
    if (!values.length) return null;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Number((sum / values.length).toFixed(2));
  }, [dischargePeriods, collectPricesForPeriods]);

  const allThresholds = React.useMemo(() => {
    if (!showThresholdLines) return [];
    const base = [];
    if (chargeThresholdValue != null)
      base.push({
        value: chargeThresholdValue,
        color: "#3B8BD4",
        label: chargeLabel,
      });
    if (dischargeThresholdValue != null)
      base.push({
        value: dischargeThresholdValue,
        color: "#E24B4A",
        label: dischargeLabel,
      });
    return [...base, ...(priceThresholds || [])];
  }, [
    chargeLabel,
    chargeThresholdValue,
    dischargeLabel,
    dischargeThresholdValue,
    priceThresholds,
    showThresholdLines,
  ]);

  const yDomain = React.useMemo(() => {
    const values = chartData
      .flatMap((point) => {
        const base = [
          point.price,
          showRealLine && Number.isFinite(point.price2) ? point.price2 : null,
          point.predictedUpper,
          point.predictedLower,
        ];
        resolvedExtraSeries.forEach((series) => {
          base.push(
            Number.isFinite(point[series.key]) ? point[series.key] : null,
          );
        });
        return base;
      })
      .filter((v) => Number.isFinite(v));
    if (!values.length) return ["auto", "auto"];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const margin = Math.max((max - min) * 0.1, 5);
    return [max, min]; // Reviso que antes era [min - margin, max + margin]
  }, [chartData, showRealLine, resolvedExtraSeries]);

    const yDomainWithMargin = React.useMemo(() => {
    // Reutilizo lógica similar para consistencia con tu original
    if (yDomain[0] === "auto") return yDomain;
    // yDomain[0] es max, yDomain[1] es min en mi calculo anterior erróneo, lo corregiré
    // El original era min, max. Corrigiendo:
    const values = chartData
      .flatMap((point) => {
        const base = [
          point.price,
          showRealLine && Number.isFinite(point.price2) ? point.price2 : null,
          point.predictedUpper,
          point.predictedLower,
        ];
        resolvedExtraSeries.forEach((series) => {
            base.push(Number.isFinite(point[series.key]) ? point[series.key] : null);
        });
        return base;
      })
      .filter((v) => Number.isFinite(v));
    
    if (!values.length) return ["auto", "auto"];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const margin = Math.max((max - min) * 0.1, 5);
    return [min - margin, max + margin];
  }, [chartData, showRealLine, resolvedExtraSeries, yDomain]); // yDomain no es realmente necesario aca

  const hasPredicted = React.useMemo(
    () => chartData.some((p) => Number.isFinite(p.price)),
    [chartData],
  );

  const hasReal = React.useMemo(
    () => showRealLine && chartData.some((p) => Number.isFinite(p.price2)),
    [chartData, showRealLine],
  );

  const hasCharge = chargePeriods.length > 0;
  const hasDischarge = dischargePeriods.length > 0;

  const extraWithData = React.useMemo(
    () =>
      resolvedExtraSeries.filter((series) =>
        chartData.some((point) => Number.isFinite(point[series.key])),
      ),
    [resolvedExtraSeries, chartData],
  );

  return {
    theme,
    palette,
    resolvedExtraSeries,
    chargePeriods,
    dischargePeriods,
    optimalChargePeriods,
    optimalDischargePeriods,
    getIndex,
    chartData,
    hourlyTicks,
    getActionLabel,
    allThresholds,
    yDomain: yDomainWithMargin,
    hasPredicted,
    hasReal,
    hasCharge,
    hasDischarge,
    extraWithData,
  };
}
