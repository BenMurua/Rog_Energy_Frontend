import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import DateSelector from "../DateSelector/DateSelector";
import "./StatisticsControl.css"; // Asumiendo que crearemos un CSS

const StatisticsControl = ({
  onDateRangeChange,
  onSelectionChange,
  idealAvg,
  predictionAvg,
  idealCount,
  predictionCount,
  capturePercentage,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState([false, false, true]);
  const [startDate, setStartDate] = useState("2025-12-07");

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const maxDate = yesterdayStr;
  const [endDate, setEndDate] = useState(yesterdayStr);

  const associations = {
    1: "Processed: First text",
    2: "Processed: Second text",
    3: "Processed: Third text",
  };

  const texts = [
    t("statistics.1hour"),
    t("statistics.2hour"),
    t("statistics.4hour"),
  ];

  // Función "biblioteca" que asigna otro texto basado en el index
  const processText = (index) => {
    return t(`statistics.processed${index + 1}`);
  };

  const handleCheckboxChange = (index) => {
    const newSelected = [false, false, false];
    newSelected[index] = true;
    setSelected(newSelected);
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  const handleStartDateChange = useCallback(
    ({ fecha_inicio }) => {
      const dateStr = fecha_inicio.split(" ")[0];
      setStartDate(dateStr);
      if (onDateRangeChange) {
        onDateRangeChange({ start: dateStr, end: endDate });
      }
    },
    [onDateRangeChange, endDate],
  );

  const handleEndDateChange = useCallback(
    ({ fecha_fin }) => {
      const dateStr = fecha_fin.split(" ")[0];
      setEndDate(dateStr);
      if (onDateRangeChange) {
        onDateRangeChange({ start: startDate, end: dateStr });
      }
    },
    [onDateRangeChange, startDate],
  );

  return (
    <div className="statistics-control-container">
      <h2>{t("statistics.title")}</h2>
      <div className="date-selector-row">
        <label className="Label">{t("statistics.startingDate")}:</label>
        <DateSelector
          onChange={handleStartDateChange}
          initialDate={startDate}
          maxDate={maxDate}
        />
      </div>
      <div className="date-selector-row">
        <label>{t("statistics.finalDate")}:</label>
        <DateSelector
          onChange={handleEndDateChange}
          initialDate={endDate}
          maxDate={maxDate}
        />
      </div>
      <div className="text-lines">
        {texts.map((text, index) => (
          <div key={index} className="text-line">
            <input
              type="checkbox"
              checked={selected[index]}
              onChange={() => handleCheckboxChange(index)}
            />
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="averages">
        <div className="average-line">
          <span style={{ fontSize: "larger" }}>
            {t("statistics.idealPriceSpread")}:{" "}
            {idealAvg !== undefined ? idealAvg.toFixed(2) + " €/MWh" : "N/A"} (
            {idealCount} {t("statistics.days")})
          </span>
        </div>
        <div className="average-line">
          <span style={{ fontSize: "larger" }}>
            {t("statistics.predictionPriceSpread")}:{" "}
            {predictionAvg !== undefined
              ? predictionAvg.toFixed(2) + " €/MWh"
              : "N/A"}{" "}
            ({predictionCount} {t("statistics.days")})
          </span>
        </div>
        <div className="average-line">
          <span style={{ fontSize: "larger" }}>
            {t("statistics.capturePercentage")}:{" "}
            {capturePercentage !== undefined
              ? capturePercentage.toFixed(2) + "%"
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsControl;
