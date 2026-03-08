import React from "react";
import "./SelectSystemDuration.css";
import { useTranslation } from "react-i18next";

const OPTIONS = [
  { label: "1h", value: "1h" },
  { label: "2h", value: "2h" },
  { label: "4h", value: "4h" },
];

export default function SelectSystemDuration({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="select-system-duration-container">
      <label htmlFor="system-duration" className="select-system-duration-label">
        {t("SelectSystemDuration.label")}
      </label>
      <select
        id="system-duration"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-system-duration-select"
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
