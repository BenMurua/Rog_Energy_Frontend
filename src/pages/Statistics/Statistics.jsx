import React, { useState, useCallback } from "react";
import StatisticsControl from "../../components/StatisticsSelector/StatisticsControl";
import "./Statistics.css";
import StatisticsChart from "../../components/StatisticsChart/StatisticsChart";
import useMultipleEnergyData from "../../hooks/useMultipleEnergyData";
import { useTranslation } from "react-i18next";
import energyConfig from "../../config/energyQueries.json";

const Statistics = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState({
    fecha_inicio: "2025-12-18 00:00:00",
    fecha_fin: "2025-12-22 00:00:00",
  });
  const [selected, setSelected] = useState([false, false, true]);

  // Usar el hook para obtener datos
  const { data, isLoading, error } = useMultipleEnergyData(
    energyConfig.queries,
    dateRange.fecha_inicio,
    dateRange.fecha_fin
  );

  const handleDateRangeChange = useCallback(
    (newDateRange) => {
      if (
        newDateRange.start !== dateRange.fecha_inicio ||
        newDateRange.end !== dateRange.fecha_fin
      ) {
        setDateRange({
          fecha_inicio: `${newDateRange.start} 00:00:00`,
          fecha_fin: `${newDateRange.end} 00:00:00`,
        });
      }
    },
    [dateRange.fecha_inicio, dateRange.fecha_fin]
  );

  const handleSelectionChange = useCallback((newSelected) => {
    setSelected(newSelected);
  }, []);

  const delta = selected[0]
    ? data.prediction_delta1h
    : selected[1]
    ? data.prediction_delta2h
    : selected[2]
    ? data.prediction_delta4h
    : null;

  const data1 = selected[0]
    ? data.ideal_delta1h
    : selected[1]
    ? data.ideal_delta2h
    : selected[2]
    ? data.ideal_delta4h
    : null;

  const validData1 = data1 ? data1.filter((item) => item.price !== 0) : [];
  const idealAvg =
    validData1.length > 0
      ? validData1.reduce((sum, item) => sum + item.price, 0) /
        validData1.length
      : undefined;
  const idealCount = validData1.length;

  const validDelta = delta ? delta.filter((item) => item.price !== 0) : [];
  const predictionAvg =
    validDelta.length > 0
      ? validDelta.reduce((sum, item) => sum + item.price, 0) /
        validDelta.length
      : undefined;
  const predictionCount = validDelta.length;

  const capturePercentage =
    idealAvg && predictionAvg ? (predictionAvg / idealAvg) * 100 : undefined;

  return (
    <div className="statistics-page">
      <StatisticsControl
        onDateRangeChange={handleDateRangeChange}
        onSelectionChange={handleSelectionChange}
        idealAvg={idealAvg}
        predictionAvg={predictionAvg}
        idealCount={idealCount}
        predictionCount={predictionCount}
        capturePercentage={capturePercentage}
      />
      {isLoading ? (
        <p>{t("prediction.loading")}</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <StatisticsChart data={data1 || []} data2={delta} />
      )}
    </div>
  );
};

export default Statistics;
