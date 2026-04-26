import React from "react";
import "./SelectPredictionSource.css";
import { useTranslation } from "react-i18next";

const OPTIONS = [
  { label: "V1", value: "V1" },
  { label: "V2", value: "V2" },
  { label: "V3", value: "V3" },
  { label: "V4", value: "V4" },
  { label: "V5", value: "V5" },
];

export default function SelectPredictionSource({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="select-prediction-source-container">
      <label
        htmlFor="prediction-source"
        className="select-prediction-source-label"
      >
        {t("prediction.dataSourceLabel")}
      </label>
      <select
        id="prediction-source"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-prediction-source-select"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
