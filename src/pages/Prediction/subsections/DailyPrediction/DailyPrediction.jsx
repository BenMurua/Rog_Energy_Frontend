import { useState } from "react";
import DailyChart from "../../../../components/DailyChart/DailyChart";
import useMultipleEnergyData from "../../../../hooks/useMultipleEnergyData";
import { useTranslation } from "react-i18next";
import energyConfig from "../../../../config/energyQueries.json";
import SelectSystemDuration from "../../../../components/SelectSystemDuration/SelectSystemDuration";
import { usePredictionVersion } from "../../../../context/PredictionVersionContext";
import PredictionInfoSidebar from "./PredictionInfoSidebar";
import {
  buildPeriodSeries,
  buildPointsSeries,
  findBestChargeDischargePoints,
  findOptimalNonOverlappingWindows,
  getWindowSizeFromSeries,
} from "../../../../utils/predictionPeriods";

export default function DailyPrediction() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const predictionDate = tomorrow.toLocaleDateString();

  const [duration, setDuration] = useState("4h");
  const [useHourly, setUseHourly] = useState(true);
  const { predictionVersion } = usePredictionVersion();
  const versionPrefix =
    predictionVersion === "V1"
      ? predictionVersion
      : predictionVersion.toLowerCase();
  const priceTable = `${versionPrefix}_predicted_data`;
  const { t } = useTranslation();

  const fecha_inicio = `${tomorrowStr} 00:00:00`;
  const fecha_fin = `${tomorrowStr} 23:45:00`;

  const filteredQueries = energyConfig.queries
    .filter((q) => q.key === "price")
    .map((q) => {
      if (q.key === "price") {
        return {
          key: q.key,
          tabla: priceTable,
          variable: q.variable,
          ...(q.filterUniquePerDay && {
            filterUniquePerDay: q.filterUniquePerDay,
          }),
        };
      }
      return q;
    });

  const { data, isLoading, error } = useMultipleEnergyData(
    filteredQueries,
    fecha_inicio,
    fecha_fin,
  );

  const priceSeries = data.price || [];
  const pointCount = getWindowSizeFromSeries(duration, priceSeries);
  const averagePriceForPeriod = (series, periodSeries) => {
    if (!Array.isArray(series) || !Array.isArray(periodSeries)) return null;
    let sum = 0;
    let count = 0;
    series.forEach((item, index) => {
      if (periodSeries[index]?.price !== 1) return;
      const value = Number(item?.price);
      if (!Number.isFinite(value)) return;
      sum += value;
      count += 1;
    });
    if (!count) return null;
    return Number((sum / count).toFixed(2));
  };
  const chargePeriod = useHourly
    ? (() => {
        const { chargeWindow } = findOptimalNonOverlappingWindows(
          priceSeries,
          pointCount,
        );
        return buildPeriodSeries(priceSeries, chargeWindow);
      })()
    : (() => {
        const { chargePoints } = findBestChargeDischargePoints(
          priceSeries,
          pointCount,
        );
        return buildPointsSeries(priceSeries, chargePoints);
      })();

  const dischargePeriod = useHourly
    ? (() => {
        const { dischargeWindow } = findOptimalNonOverlappingWindows(
          priceSeries,
          pointCount,
        );
        return buildPeriodSeries(priceSeries, dischargeWindow);
      })()
    : (() => {
        const { dischargePoints } = findBestChargeDischargePoints(
          priceSeries,
          pointCount,
        );
        return buildPointsSeries(priceSeries, dischargePoints);
      })();

  const chargeAverage = averagePriceForPeriod(priceSeries, chargePeriod);
  const dischargeAverage = averagePriceForPeriod(priceSeries, dischargePeriod);

  return (
    <div className="prediction-container">
      <div className="sidebar-base prediction-sidebar">
        <SelectSystemDuration value={duration} onChange={setDuration} />
        <button
          type="button"
          className="period-mode-toggle"
          onClick={() => setUseHourly((prev) => !prev)}
        >
          {useHourly
            ? t("prediction.chargeDischargeHourly")
            : t("prediction.chargeDischarge15min")}
        </button>
        <div className="period-averages">
          <div className="period-average-row">
            <span>{t("prediction.avgChargePrice")}</span>
            <strong>
              {chargeAverage != null ? `${chargeAverage} €` : "—"}
            </strong>
          </div>
          <div className="period-average-row">
            <span>{t("prediction.avgDischargePrice")}</span>
            <strong>
              {dischargeAverage != null ? `${dischargeAverage} €` : "—"}
            </strong>
          </div>
        </div>
        <PredictionInfoSidebar predictionDate={predictionDate} />
      </div>
      <div className="prediction-chart">
        {isLoading ? (
          <div className="battery-loader-container">
            <div className="battery-loader">
              <div className="battery-level"></div>
            </div>
            <p className="loading-text">
              {t("prediction.loading", "Loading...")}
            </p>
          </div>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <DailyChart
            data={priceSeries}
            data2={null}
            chargePeriod={chargePeriod}
            dischargePeriod={dischargePeriod}
            data1Label={t("prediction.predictedPrice")}
            chargeLabel={t("prediction.chargeLabel")}
            dischargeLabel={t("prediction.dischargeLabel")}
            showRealLine={false}
            showConfidenceBand={false}
          />
        )}
      </div>
    </div>
  );
}
