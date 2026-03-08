// src/utils/chartUtils.js

/**
 * Extrae periodos consecutivos donde price es truthy (true o 1)
 * @param {Array} dataArray - Array de objetos con { hour, price }
 * @returns {Array} - Array de periodos { start, end }
 */
export const extractPeriods = (dataArray) => {
  if (!dataArray || dataArray.length === 0) return [];

  const periods = [];
  let start = null;

  dataArray.forEach((item, index) => {
    // Soporta tanto true/false como 1/0
    const isActive = item.price === true || item.price === 1;
    
    if (isActive && start === null) {
      start = item.hour;
    } else if (!isActive && start !== null) {
      periods.push({ start, end: dataArray[index - 1].hour });
      start = null;
    }
  });

  // Si termina con un periodo activo
  if (start !== null) {
    periods.push({ start, end: dataArray[dataArray.length - 1].hour });
  }

  return periods;
};
