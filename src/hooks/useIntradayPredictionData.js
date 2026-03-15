import { useEffect, useState } from "react";
import { generatePredictionIntradayMockData } from "../mocks/marketMockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api/v1";

async function fetchIntradayPredictionFromApi(fecha_inicio, fecha_fin, session_id) {
  const response = await fetch(`${API_BASE_URL}/intraday-prediction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha_inicio, fecha_fin, session_id }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export default function useIntradayPredictionData({ sessionId, fechaInicio, fechaFin, useMock = true }) {
  const [data, setData] = useState({ price: [], realPrice: [], table: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = useMock
          ? generatePredictionIntradayMockData(sessionId)
          : await fetchIntradayPredictionFromApi(fechaInicio, fechaFin, sessionId);

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Error loading intraday data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [sessionId, fechaInicio, fechaFin, useMock]);

  return { data, isLoading, error };
}
