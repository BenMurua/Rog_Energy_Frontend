import { useMemo, useState } from "react";
import DailyChart from "../../../../components/DailyChart/DailyChart";
import useIntradayPredictionData from "../../../../hooks/useIntradayPredictionData";
import { SESSION_IDS } from "../../../../mocks/marketMockData";
import "../../../sectionShared.css";

const toApiDate = (date) => `${date.toISOString().slice(0, 10)} 00:00:00`;

export default function IntradayPrediction() {
  const [sessionId, setSessionId] = useState("ID1");

  const dateRange = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

    return {
      start: toApiDate(tomorrow),
      end: toApiDate(dayAfterTomorrow),
    };
  }, []);

  const { data, isLoading, error } = useIntradayPredictionData({
    sessionId,
    fechaInicio: dateRange.start,
    fechaFin: dateRange.end,
    useMock: true,
  });

  return (
    <div className="section-panel">
      <div className="section-header">
        <h3 className="section-title">Mercado Intradiario (ID)</h3>
        <div className="quick-range-buttons">
          {SESSION_IDS.map((session) => (
            <button
              key={session}
              type="button"
              className={`quick-range-button ${sessionId === session ? "active" : ""}`}
              onClick={() => setSessionId(session)}
            >
              {session}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="battery-loader-container">
          <div className="battery-loader">
            <div className="battery-level"></div>
          </div>
          <p className="loading-text">Cargando sesion {sessionId}...</p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <div className="chart-shell">
            <DailyChart
              data={data.price || []}
              data2={data.realPrice || []}
              chargePeriod={[]}
              dischargePeriod={[]}
              data1Label={`Prediccion ${sessionId}`}
              data2Label={`Real ${sessionId}`}
              chargeLabel="Carga"
              dischargeLabel="Descarga"
              optimalChargeLabel="Carga optima"
              optimalDischargeLabel="Descarga optima"
            />
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Sesion</th>
                  <th>Precio predicho (EUR/MWh)</th>
                  <th>Precio real (EUR/MWh)</th>
                </tr>
              </thead>
              <tbody>
                {(data.table || []).map((row) => (
                  <tr key={`${sessionId}-${row.hour}`}>
                    <td>{row.hour}</td>
                    <td>{sessionId}</td>
                    <td>{row.predicted.toFixed(2)}</td>
                    <td>{row.real.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
