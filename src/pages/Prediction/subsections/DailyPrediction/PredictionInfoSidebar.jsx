import React from "react";
import { useTranslation } from "react-i18next";
import "./PredictionInfoSidebar.css";

export default function PredictionInfoSidebar({
  predictionDate,
  bestChargeTimeframe,
  bestDischargeTimeframe,
}) {
  const { t } = useTranslation();

  return (
    <div className="prediction-info-sidebar">
      <div className="prediction-info-content">
        <p className="prediction-date-text">
          {t("prediction.for_date", { date: predictionDate })}
        </p>
        <p className="optimal-charge-text">
          {t("prediction.optimal_charge_timeframe")} {bestChargeTimeframe}
        </p>
        <p className="optimal-discharge-text">
          {t("prediction.optimal_discharge_timeframe")} {bestDischargeTimeframe}
        </p>
      </div>
    </div>
  );
}
