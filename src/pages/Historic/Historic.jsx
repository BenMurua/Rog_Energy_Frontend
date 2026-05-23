import { useState } from "react";
import "./Historic.css";
import DailyChart from "../../components/DailyChart/DailyChart";
import useMultipleEnergyData from "../../hooks/useMultipleEnergyData";
import { useTranslation } from "react-i18next";
import DateSelector from "../../components/DateSelector/DateSelector";
import energyConfig from "../../config/energyQueries.json";
import SelectSystemDuration from "../../components/SelectSystemDuration/SelectSystemDuration";
import { usePredictionVersion } from "../../context/PredictionVersionContext";
import {
  buildPeriodSeries,
  buildPointsSeries,
  findBestChargeDischargePoints,
  findOptimalNonOverlappingWindows,
  getWindowSizeFromSeries,
} from "../../utils/predictionPeriods";

const Historic = () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [apiRange, setApiRange] = useState({
    fecha_inicio: `${todayStr} 00:00:00`,
    fecha_fin: `${todayStr} 23:45:00`,
  });
  const [duration, setDuration] = useState("4h"); // valor inicial
  const [useHourly, setUseHourly] = useState(true);
  const { t } = useTranslation();
  const { predictionVersion } = usePredictionVersion();
  const versionPrefix =
    predictionVersion === "V1"
      ? predictionVersion
      : predictionVersion.toLowerCase();

  // Construir tabla de precio según versión seleccionada
  const priceTable = `${versionPrefix}_predicted_data`;
  const statsTable = `${versionPrefix}_data_stadistics`;

  const isVersionedStatsKey = (key) =>
    key.startsWith("charge") || key.startsWith("discharge");

  // Modificar queries para usar la tabla correcta para precio
  const filteredQueries = energyConfig.queries.map((q) => {
    if (q.key === "price") {
      return {
        key: q.key,
        tabla: priceTable,
        variable: q.variable,
        ...(q.filterUniquePerDay && {
          filterUniquePerDay: q.filterUniquePerDay,
        }),
      };
    }
    if (isVersionedStatsKey(q.key)) {
      return {
        key: q.key,
        tabla: statsTable,
        variable: q.variable,
        ...(q.filterUniquePerDay && {
          filterUniquePerDay: q.filterUniquePerDay,
        }),
      };
    }
    return q;
  });

  // Un hook para llamar a la API
  const { data, isLoading, error } = useMultipleEnergyData(
    filteredQueries,
    apiRange.fecha_inicio,
    apiRange.fecha_fin,
  );

  const priceSeries = data.price || [];
  const realPriceSeries = data.realPrice || [];
  const pointCount = getWindowSizeFromSeries(duration, priceSeries);

  const chargePeriod = useHourly
    ? (() => {
        const { chargeWindow } = findOptimalNonOverlappingWindows(
          priceSeries,
          pointCount,
        );
        return buildPeriodSeries(priceSeries, chargeWindow);
      })()
    : (() => {
        const { chargePoints } = findBestChargeDischargePoints(
          priceSeries,
          pointCount,
        );
        return buildPointsSeries(priceSeries, chargePoints);
      })();

  const dischargePeriod = useHourly
    ? (() => {
        const { dischargeWindow } = findOptimalNonOverlappingWindows(
          priceSeries,
          pointCount,
        );
        return buildPeriodSeries(priceSeries, dischargeWindow);
      })()
    : (() => {
        const { dischargePoints } = findBestChargeDischargePoints(
          priceSeries,
          pointCount,
        );
        return buildPointsSeries(priceSeries, dischargePoints);
      })();

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
          <div className="period-panel">
            <button
              type="button"
              className="period-mode-toggle"
              onClick={() => setUseHourly((prev) => !prev)}
            >
              {useHourly
                ? t("prediction.chargeDischargeHourly")
                : t("prediction.chargeDischarge15min")}
            </button>
          </div>
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
            data={priceSeries}
            data2={realPriceSeries}
            chargePeriod={chargePeriod}
            dischargePeriod={dischargePeriod}
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
