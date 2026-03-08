// src/pages/Prediction/Prediction.jsx

import { useState } from "react";
import "./Prediction.css";
import DailyChart from "../../components/DailyChart/DailyChart";
import useMultipleEnergyData from "../../hooks/useMultipleEnergyData";
import { useTranslation } from "react-i18next";
import energyConfig from "../../config/energyQueries.json";
import SelectSystemDuration from "../../components/SelectSystemDuration/SelectSystemDuration";

const Prediction = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const predictionDate = tomorrow.toLocaleDateString();
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().slice(0, 10);

  const [apiRange, setApiRange] = useState({
    fecha_inicio: `${tomorrowStr} 00:00:00`,
    fecha_fin: `${dayAfterTomorrowStr} 00:00:00`,
  });
  const [duration, setDuration] = useState("4h"); // valor inicial
  const { t } = useTranslation();

  // Un hook para llamar a la API
  const { data, isLoading, error } = useMultipleEnergyData(
    energyConfig.queries,
    apiRange.fecha_inicio,
    apiRange.fecha_fin,
  );

  // Calcular los periodos óptimos para cargar y descargar
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
        // Sumar 15 minutos al end
        const [hour, min] = end.split(":").map(Number);
        const totalMinutes = hour * 60 + min + 15;
        const newHour = Math.floor(totalMinutes / 60);
        const newMin = totalMinutes % 60;
        end = `${String(newHour).padStart(2, "0")}:${String(newMin).padStart(
          2,
          "0",
        )}`;
        periods.push(`${start}-${end}`);
        start = null;
      }
    });
    if (start !== null) {
      let end = period[period.length - 1].hour;
      // Sumar 15 minutos al end
      const [hour, min] = end.split(":").map(Number);
      const totalMinutes = hour * 60 + min + 15;
      const newHour = Math.floor(totalMinutes / 60);
      const newMin = totalMinutes % 60;
      end = `${String(newHour).padStart(2, "0")}:${String(newMin).padStart(
        2,
        "0",
      )}`;
      periods.push(`${start}-${end}`);
    }
    return periods.join(", ");
  };
  // Obtener solo el primer bloque de carga/descarga
  const getFirstBlock = (period) => {
    const items = period?.filter((item) => item.price === true) || [];
    if (items.length === 0) return [];
    const block = [];
    block.push(items[0]);
    for (let i = 1; i < items.length; i++) {
      const currentHour = parseInt(items[i].hour.split(":")[0]);
      const prevHour = parseInt(items[i - 1].hour.split(":")[0]);
      if (currentHour === prevHour + 1) {
        block.push(items[i]);
      } else {
        break;
      }
    }
    return block;
  };

  const chargePeriodFiltered = getFirstBlock(data[`charge${duration}`]);
  const dischargePeriodFiltered = getFirstBlock(data[`discharge${duration}`]);
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
          <p>{t("prediction.loading")}</p>
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
};

export default Prediction;
