import { useState } from "react";
import "./Historic.css";
import DailyChart from "../../components/DailyChart/DailyChart";
import useMultipleEnergyData from "../../hooks/useMultipleEnergyData";
import { useTranslation } from "react-i18next";
import DateSelector from "../../components/DateSelector/DateSelector";
import energyConfig from "../../config/energyQueries.json";
import SelectSystemDuration from "../../components/SelectSystemDuration/SelectSystemDuration";
import { usePredictionVersion } from "../../context/PredictionVersionContext";

const Historic = () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [apiRange, setApiRange] = useState({
    fecha_inicio: `${todayStr} 00:00:00`,
    fecha_fin: `${todayStr} 23:45:00`,
  });
  const [duration, setDuration] = useState("4h"); // valor inicial
  const { t } = useTranslation();
  const { predictionVersion } = usePredictionVersion();
  const versionPrefix =
    predictionVersion === "V1"
      ? predictionVersion
      : predictionVersion.toLowerCase();

  // Construir tabla de precio según versión seleccionada
  const priceTable = `${versionPrefix}_predicted_data`;

  // Modificar queries para usar la tabla correcta para precio
  const filteredQueries = energyConfig.queries.map((q) =>
    q.key === "price" ? { ...q, tabla: priceTable } : q,
  );

  // Un hook para llamar a la API
  const { data, isLoading, error } = useMultipleEnergyData(
    filteredQueries,
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
      <div className="sidebar-base historic-sidebar">
        <div className="controls-section historic-controls">
          <DateSelector
            onChange={handleRangeChange}
            initialDate={apiRange.fecha_inicio.slice(0, 10)}
          />
          <SelectSystemDuration value={duration} onChange={setDuration} />
        </div>
      </div>
      <div className="historic-chart">
        {isLoading ? (
          <div className="battery-loader-container">
            <div className="battery-loader">
              <div className="battery-level"></div>
            </div>
            <p className="loading-text">
              {t("historic.loading", "Loading...")}
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
            data1Label={t("historic.predictedPrice")}
            data2Label={t("historic.realPrice")}
            chargeLabel={t("historic.chargeLabel")}
            dischargeLabel={t("historic.dischargeLabel")}
            showRealLine={true}
            showConfidenceBand={false}
          />
        )}
      </div>
    </div>
  );
};

export default Historic;
