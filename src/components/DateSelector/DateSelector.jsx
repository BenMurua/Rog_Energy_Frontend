import "./DateSelector.css";
import { useState, useEffect } from "react";

// Formatea Date a `YYYY-MM-DD HH:mm:SS` para la API
const formatApiDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

export default function DateSelector({ onChange, initialDate, maxDate }) {
  const today = new Date();
  const defaultIso = initialDate
    ? typeof initialDate === "string"
      ? initialDate.slice(0, 10)
      : initialDate.toISOString().slice(0, 10)
    : today.toISOString().slice(0, 10);
  const [day, setDay] = useState(defaultIso);

  // Emitir fecha_inicio/fecha_fin para el día seleccionado
  useEffect(() => {
    const start = new Date(day + "T00:00:00");
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + 1);

    if (onChange) {
      onChange({
        fecha_inicio: formatApiDate(start),
        fecha_fin: formatApiDate(end),
      });
    }
  }, [day, onChange]);

  return (
    <div className="date-selector">
      <label className="label"></label>
      <input
        type="date"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        max={maxDate}
      />
    </div>
  );
}
