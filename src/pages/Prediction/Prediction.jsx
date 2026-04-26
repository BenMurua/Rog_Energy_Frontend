// src/pages/Prediction/Prediction.jsx

import { useState } from "react";
import "./Prediction.css";
import DailyChart from "../../components/DailyChart/DailyChart";
import useMultipleEnergyData from "../../hooks/useMultipleEnergyData";
import { useTranslation } from "react-i18next";
import energyConfig from "../../config/energyQueries.json";
import SelectSystemDuration from "../../components/SelectSystemDuration/SelectSystemDuration";
import { usePredictionVersion } from "../../context/PredictionVersionContext";
import {
  buildPeriodSeries,
  findBestWindow,
  getWindowSizeFromDuration,
} from "../../utils/predictionPeriods";

const Prediction = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const predictionDate = tomorrow.toLocaleDateString();

  const [duration, setDuration] = useState("4h");
  const { predictionVersion } = usePredictionVersion();
  const priceTable = `${predictionVersion}_predicted_data`;
  const { t } = useTranslation();

  // Filtrar solo los datos necesarios: predicción y precio real
  const filteredQueries = energyConfig.queries
    .filter((q) => q.key === "price" || q.key === "realPrice")
    .map((q) => (q.key === "price" ? { ...q, tabla: priceTable } : q));

  const { data, isLoading, error } = useMultipleEnergyData(
    filteredQueries,
    `${tomorrowStr} 00:00:00`,
    `${tomorrowStr} 23:45:00`,
  );

  const priceSeries = data.price || [];
  const realPriceSeries = data.realPrice || [];
  const windowSize = getWindowSizeFromDuration(duration);

  const chargeWindow = findBestWindow(priceSeries, windowSize, "min");
  const dischargeWindow = findBestWindow(priceSeries, windowSize, "max");

  const chargePeriod = buildPeriodSeries(priceSeries, chargeWindow);
  const dischargePeriod = buildPeriodSeries(priceSeries, dischargeWindow);

  return (
    <div className="prediction-container">
      <div className="sidebar-base prediction-sidebar">
        <div className="controls-section prediction-controls">
          <SelectSystemDuration value={duration} onChange={setDuration} />
          <p className="prediction-date-text">
            {t("prediction.for_date", { date: predictionDate })}
          </p>
        </div>
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
            data2={realPriceSeries}
            chargePeriod={chargePeriod}
            dischargePeriod={dischargePeriod}
            data1Label={t("prediction.predictedPrice")}
            data2Label={t("prediction.realPrice")}
            chargeLabel={t("prediction.chargeLabel")}
            dischargeLabel={t("prediction.dischargeLabel")}
          />
        )}
      </div>
    </div>
  );
};

export default Prediction;
