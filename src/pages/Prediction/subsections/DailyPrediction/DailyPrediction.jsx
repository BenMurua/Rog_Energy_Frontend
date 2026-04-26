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
  findBestWindow,
  getWindowSizeFromDuration,
} from "../../../../utils/predictionPeriods";

export default function DailyPrediction() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const predictionDate = tomorrow.toLocaleDateString();

  const [duration, setDuration] = useState("4h");
  const { predictionVersion } = usePredictionVersion();
  const priceTable = `${predictionVersion}_predicted_data`;
  const { t } = useTranslation();

  const fecha_inicio = `${tomorrowStr} 00:00:00`;
  const fecha_fin = `${tomorrowStr} 23:45:00`;

  const filteredQueries = energyConfig.queries
    .filter((q) => q.key === "price")
    .map((q) => (q.key === "price" ? { ...q, tabla: priceTable } : q));

  const { data, isLoading, error } = useMultipleEnergyData(
    filteredQueries,
    fecha_inicio,
    fecha_fin,
  );

  const priceSeries = data.price || [];
  const windowSize = getWindowSizeFromDuration(duration);

  const chargeWindow = findBestWindow(priceSeries, windowSize, "min");
  const dischargeWindow = findBestWindow(priceSeries, windowSize, "max");

  const chargePeriod = buildPeriodSeries(priceSeries, chargeWindow);
  const dischargePeriod = buildPeriodSeries(priceSeries, dischargeWindow);

  return (
    <div className="prediction-container">
      <div className="sidebar-base prediction-sidebar">
        <SelectSystemDuration value={duration} onChange={setDuration} />
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
