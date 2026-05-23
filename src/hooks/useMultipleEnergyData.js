// src/hooks/useMultipleEnergyData.js
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api/v1";

// Función para llamar a la API
const fetchFromAPI = async (tabla, variable, fecha_inicio, fecha_fin) => {
  const payload = { tabla, variable, fecha_inicio, fecha_fin };
  console.debug("API request:", payload);
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch (e) {
    parsed = text;
  }

  if (!response.ok) {
    const err = new Error(`API Error: ${response.status}`);
    err.status = response.status;
    err.body = parsed;
    console.warn("API response error:", { status: response.status, body: parsed, payload });
    throw err;
  }

  return parsed;
};

const normalizeNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const normalized = value.replace(/\s/g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

// Función para mapear respuesta al formato del gráfico
const mapToChartFormat = (items, variable) => {
  const pad = (n) => String(n).padStart(2, "0");
  return items.map((it, index) => {
    const rawDate =
      it.datetime ?? it.date ?? it.day ?? it.fecha ?? it.timestamp ?? null;
    const dt = rawDate ? new Date(rawDate) : null;
    const isValidDate = dt instanceof Date && !Number.isNaN(dt.getTime());
    const hour = isValidDate
      ? `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
      : "00:00";
    const dateStr = isValidDate
      ? dt.toLocaleDateString("es-ES")
      : typeof rawDate === "string"
        ? rawDate
        : String(index + 1);
    const rawValue = it[variable];
    // Si es booleano, mantenerlo; si es número/str, normalizar
    const price =
      typeof rawValue === "boolean" ? rawValue : normalizeNumber(rawValue);
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

// Caché en memoria para evitar llamadas redundantes de los mismos datos exactos
const apiCache = {};

export default function useMultipleEnergyData(queries = [], fecha_inicio, fecha_fin, raw = false) {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Crear una key estable para las dependencias basada en propiedades específicas
  // Esto asegura que el efecto se ejecute cuando ANY propiedad relevante cambia
  const queriesKey = JSON.stringify(
    queries.map(q => ({
      key: q.key,
      tabla: q.tabla,
      variable: q.variable,
      filterUniquePerDay: q.filterUniquePerDay
    }))
  );

  useEffect(() => {
    if (!fecha_inicio || !fecha_fin || queries.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      const startTime = Date.now();
      setIsLoading(true);
      setError(null);

      // Usar fecha y las queries como clave para nuestro cache
      const cacheKey = `${queriesKey}_${fecha_inicio}_${fecha_fin}_${raw}`;

      // Función auxiliar para asegurar un tiempo mínimo de carga en pantalla
      const finishLoadingWithDelay = (dataObj) => {
        const elapsedTime = Date.now() - startTime;
        const MIN_LOADING_TIME = 800; // 800ms para que luzca la animación de la batería
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
        
        setTimeout(() => {
          setData(dataObj);
          setIsLoading(false);
        }, remainingTime);
      };

      if (apiCache[cacheKey]) {
        finishLoadingWithDelay(apiCache[cacheKey]);
        return;
      }

      try {
        // Ejecutar todas las queries en paralelo con Promise.allSettled
        // para que un error individual no rompa las demás
        const promises = queries.map(async (query) => {
          const { key, tabla, variable, originalTabla } = query;
          const tried = [];
          const attemptFetch = async (candidateTabla) => {
            tried.push(candidateTabla);
            try {
              const response = await fetchFromAPI(candidateTabla, variable, fecha_inicio, fecha_fin);
              const items = Array.isArray(response) ? response : response?.prices || [];
              let mapped = raw ? items : mapToChartFormat(items, variable);
              if (query.filterUniquePerDay) mapped = filterUniquePerDay(mapped);
              return { success: true, data: mapped, usedTabla: candidateTabla };
            } catch (err) {
              return { success: false, error: err, usedTabla: candidateTabla };
            }
          };

          // First try the provided tabla
          let result = await attemptFetch(tabla);

          // If got 400, try fallbacks: originalTabla (unversioned) and lowercased variants
          if (!result.success && result.error && result.error.status === 400) {
            const fallbacks = [];
            if (originalTabla && originalTabla !== tabla) fallbacks.push(originalTabla);
            // try lowercased version of tabla
            if (typeof tabla === "string") fallbacks.push(tabla.toLowerCase());
            if (originalTabla && typeof originalTabla === "string") fallbacks.push(originalTabla.toLowerCase());

            for (const fb of fallbacks) {
              if (!fb) continue;
              const fbResult = await attemptFetch(fb);
              if (fbResult.success) {
                result = fbResult;
                break;
              }
            }
          }

          if (result.success) {
            if (result.usedTabla && result.usedTabla !== tabla) {
              console.info(`Query ${key} succeeded using fallback tabla: ${result.usedTabla}`);
            }
            return { key, data: result.data, success: true };
          }

          const errMsg = result.error ? `${result.error.message} (tried: ${tried.join(",")})` : "Unknown error";
          console.warn(`Error fetching ${key} (${variable}):`, errMsg);
          return { key, data: [], success: false, error: errMsg };
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
          // Todas fallaron -> incluir detalles
          const details = failures.map(f => ({ key: f.key, error: f.error }));
          const msg = `Error al cargar datos de la API: ${JSON.stringify(details)}`;
          setError(msg);
          console.error(msg);
        } else if (failures.length > 0) {
          // Algunas fallaron, pero mostramos los datos que sí llegaron
          console.warn(`${failures.length} de ${results.length} queries fallaron`, failures);
          // No bloquear la UI por fallos parciales
          setError(null);
          // Guardar en cache los que sí tuvieron éxito
          apiCache[cacheKey] = dataObj;
        } else {
          // Guardar en cache solo si todas tuvieron éxito
          apiCache[cacheKey] = dataObj;
        }

        // Llamamos a la función auxiliar para asentar el mínimo de 800ms antes de enseñar
        finishLoadingWithDelay(dataObj);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching multiple energy data:", err);
        setIsLoading(false); // Si hay excepción general, caemos rápido y mostramos el error
      }
    };

    fetchAll();
  }, [queriesKey, fecha_inicio, fecha_fin]);

  return { data, isLoading, error };
}
