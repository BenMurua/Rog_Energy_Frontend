import { useState } from "react";
import "./Historic.css";
import DailyChart from "../../components/DailyChart/DailyChart";
import useMultipleEnergyData from "../../hooks/useMultipleEnergyData";
import { useTranslation } from "react-i18next";
import DateSelector from "../../components/DateSelector/DateSelector";
import energyConfig from "../../config/energyQueries.json";
import SelectSystemDuration from "../../components/SelectSystemDuration/SelectSystemDuration";

const Historic = () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const [apiRange, setApiRange] = useState({
    fecha_inicio: `${todayStr} 00:00:00`,
    fecha_fin: `${todayStr} 23:45:00`,
  });
  const [duration, setDuration] = useState("4h"); // valor inicial
  const { t } = useTranslation();

  // Un hook para llamar a la API
  const { data, isLoading, error } = useMultipleEnergyData(
    energyConfig.queries,
    apiRange.fecha_inicio,
    apiRange.fecha_fin,
  );

  const handleRangeChange = (range) => {
    if (
      range.fecha_inicio !== apiRange.fecha_inicio ||
      range.fecha_fin !== apiRange.fecha_fin
    ) {
      setApiRange(range);
    }
  };

  return (
    <div className="historic-container">
      <div className="historic-sidebar">
        <div className="historic-controls">
          <DateSelector
            onChange={handleRangeChange}
            initialDate={apiRange.fecha_inicio.slice(0, 10)}
          />
          <SelectSystemDuration value={duration} onChange={setDuration} />
        </div>
      </div>
      <div className="historic-chart">
        {isLoading ? (
          <p>{t("historic.loading")}</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <DailyChart
            data={data.price || []}
            data2={data.realPrice || []}
            chargePeriod={data[`charge${duration}`] || []}
            dischargePeriod={data[`discharge${duration}`] || []}
            data1Label={t("historic.predictedPrice")}
            data2Label={t("historic.realPrice")}
            chargeLabel={t("historic.chargeLabel")}
            dischargeLabel={t("historic.dischargeLabel")}
            optimalChargeLabel={t("historic.optimalChargeLabel")}
            optimalDischargeLabel={t("historic.optimalDischargeLabel")}
          />
        )}
      </div>
    </div>
  );
};

export default Historic;
