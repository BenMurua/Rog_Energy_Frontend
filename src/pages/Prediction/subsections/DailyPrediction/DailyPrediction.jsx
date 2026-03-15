import { useState } from "react";
import DailyChart from "../../../../components/DailyChart/DailyChart";
import useMultipleEnergyData from "../../../../hooks/useMultipleEnergyData";
import { useTranslation } from "react-i18next";
import energyConfig from "../../../../config/energyQueries.json";
import SelectSystemDuration from "../../../../components/SelectSystemDuration/SelectSystemDuration";

export default function DailyPrediction() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const predictionDate = tomorrow.toLocaleDateString();
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().slice(0, 10);

  const [apiRange] = useState({
    fecha_inicio: `${tomorrowStr} 00:00:00`,
    fecha_fin: `${dayAfterTomorrowStr} 00:00:00`,
  });
  const [duration, setDuration] = useState("4h");
  const { t } = useTranslation();

  const filteredQueries = energyConfig.queries.filter((q) => {
    return (
      q.key === "price" || q.key === "realPrice" || q.key.endsWith(duration)
    );
  });

  const { data, isLoading, error } = useMultipleEnergyData(
    filteredQueries,
    apiRange.fecha_inicio,
    apiRange.fecha_fin,
  );

  const getPeriodsString = (period) => {
    if (!period || period.length === 0) return t("prediction.not_available");
    const periods = [];
    let start = null;

    period.forEach((item, index) => {
      const isActive = item.price === true || item.price === 1;
      if (isActive && start === null) {
        start = item.hour;
      } else if (!isActive && start !== null) {
        let end = period[index - 1].hour;
        const [hour, min] = end.split(":").map(Number);
        const totalMinutes = hour * 60 + min + 15;
        const newHour = Math.floor(totalMinutes / 60);
        const newMin = totalMinutes % 60;
        end = `${String(newHour).padStart(2, "0")}:${String(newMin).padStart(2, "0")}`;
        periods.push(`${start}-${end}`);
        start = null;
      }
    });

    if (start !== null) {
      let end = period[period.length - 1].hour;
      const [hour, min] = end.split(":").map(Number);
      const totalMinutes = hour * 60 + min + 15;
      const newHour = Math.floor(totalMinutes / 60);
      const newMin = totalMinutes % 60;
      end = `${String(newHour).padStart(2, "0")}:${String(newMin).padStart(2, "0")}`;
      periods.push(`${start}-${end}`);
    }

    return periods.join(", ");
  };

  const bestChargeTimeframe = getPeriodsString(data[`charge${duration}`]);
  const bestDischargeTimeframe = getPeriodsString(data[`discharge${duration}`]);

  return (
    <div className="prediction-container">
      <div className="prediction-sidebar">
        <div className="prediction-controls">
          <SelectSystemDuration value={duration} onChange={setDuration} />
          <p className="prediction-date-text">
            {t("prediction.for_date", { date: predictionDate })}
          </p>
          <p className="optimal-charge-text">
            {t("prediction.optimal_charge_timeframe")} {bestChargeTimeframe}
          </p>
          <p className="optimal-discharge-text">
            {t("prediction.optimal_discharge_timeframe")}{" "}
            {bestDischargeTimeframe}
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
            data={data.price || []}
            data2={data.realPrice || []}
            chargePeriod={data[`charge${duration}`] || []}
            dischargePeriod={data[`discharge${duration}`] || []}
            data1Label={t("prediction.predictedPrice")}
            data2Label={t("prediction.realPrice")}
            chargeLabel={t("prediction.chargeLabel")}
            dischargeLabel={t("prediction.dischargeLabel")}
            optimalChargeLabel={t("prediction.optimalChargeLabel")}
            optimalDischargeLabel={t("prediction.optimalDischargeLabel")}
          />
        )}
      </div>
    </div>
  );
}
