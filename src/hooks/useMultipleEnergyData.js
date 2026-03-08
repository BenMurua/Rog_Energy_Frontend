// src/hooks/useMultipleEnergyData.js
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api/v1";

// Función para llamar a la API
const fetchFromAPI = async (tabla, variable, fecha_inicio, fecha_fin) => {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tabla, variable, fecha_inicio, fecha_fin }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
};

// Función para mapear respuesta al formato del gráfico
const mapToChartFormat = (items, variable) => {
  const pad = (n) => String(n).padStart(2, "0");
  return items.map((it) => {
    const dt = new Date(it.datetime);
    const hour = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    const dateStr = dt.toLocaleDateString('es-ES');
    const rawValue = it[variable];
    // Si es número, redondearlo; si es booleano, mantenerlo
    const price = typeof rawValue === "boolean" ? rawValue : 
                  rawValue != null ? Math.round(Number(rawValue)) : 0;
    return { hour, date: dateStr, price };
  });
};

// Función para filtrar a un valor único por día
const filterUniquePerDay = (data) => {
  const seen = new Set();
  return data.filter(item => {
    if (seen.has(item.date)) {
      return false;
    }
    seen.add(item.date);
    return true;
  });
};

/**
 * Hook para obtener múltiples variables de la API en paralelo.
 * 
 * @param {Array} queries - Lista de configuraciones: [{ key, tabla, variable }, ...]
 * @param {string} fecha_inicio - Fecha inicio para todas las queries
 * @param {string} fecha_fin - Fecha fin para todas las queries
 * @param {boolean} raw - Si true, devuelve los datos crudos sin mapear
 * 
 * @returns {{ data: Object, isLoading: boolean, error: string|null }}
 * 
 * Ejemplo de uso:
 * const queries = [
 *   { key: "price", tabla: "V1_predicted_data", variable: "predicted_omie_price_eur_mw" },
 *   { key: "charge1h", tabla: "V1_data_stadistics", variable: "charge_1h_hourly" },
 * ];
 * const { data, isLoading, error } = useMultipleEnergyData(queries, fecha_inicio, fecha_fin);
 * // data.price, data.charge1h, etc.
 */
export default function useMultipleEnergyData(queries = [], fecha_inicio, fecha_fin, raw = false) {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Crear una key estable para las dependencias
  const queriesKey = JSON.stringify(queries.map(q => `${q.key}-${q.tabla}-${q.variable}`));

  useEffect(() => {
    if (!fecha_inicio || !fecha_fin || queries.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Ejecutar todas las queries en paralelo con Promise.allSettled
        // para que un error individual no rompa las demás
        const promises = queries.map(async (query) => {
          const { key, tabla, variable } = query;
          try {
            const response = await fetchFromAPI(tabla, variable, fecha_inicio, fecha_fin);
            const items = Array.isArray(response) ? response : response?.prices || [];
            let mapped = raw ? items : mapToChartFormat(items, variable);
            // Para estadísticas, filtrar a un valor por día
            if (query.filterUniquePerDay) {
              mapped = filterUniquePerDay(mapped);
            }
            return { key, data: mapped, success: true };
          } catch (err) {
            console.warn(`Error fetching ${key} (${variable}):`, err.message);
            return { key, data: [], success: false, error: err.message };
          }
        });

        const results = await Promise.all(promises);

        // Convertir array de resultados a objeto { key: data }
        const dataObj = results.reduce((acc, { key, data }) => {
          acc[key] = data;
          return acc;
        }, {});

        // Verificar si hubo errores parciales
        const failures = results.filter(r => !r.success);
        if (failures.length > 0 && failures.length === results.length) {
          // Todas fallaron
          setError("Error al cargar datos de la API");
        } else if (failures.length > 0) {
          // Algunas fallaron, pero mostramos los datos que sí llegaron
          console.warn(`${failures.length} de ${results.length} queries fallaron`);
        }

        setData(dataObj);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching multiple energy data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [queriesKey, fecha_inicio, fecha_fin]);

  return { data, isLoading, error };
}
