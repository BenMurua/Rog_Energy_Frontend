const SLOT_MINUTES = 15;

const pad = (value) => String(value).padStart(2, "0");

const addMinutes = (hour, minutes) => {
  const [hours, mins] = hour.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const nextHour = Math.floor(totalMinutes / 60);
  const nextMinute = totalMinutes % 60;
  return `${pad(nextHour)}:${pad(nextMinute)}`;
};

export const getWindowSizeFromDuration = (duration) => {
  const hours = Number.parseInt(duration, 10);
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return (hours * 60) / SLOT_MINUTES;
};

export const findBestWindow = (series, windowSize, mode = "min") => {
  if (!Array.isArray(series) || series.length === 0 || windowSize <= 0) {
    return null;
  }

  let bestWindow = null;

  for (let start = 0; start <= series.length - windowSize; start += 1) {
    const window = series.slice(start, start + windowSize);
    const values = window.map((item) => Number(item?.price));

    if (values.some((value) => !Number.isFinite(value))) continue;

    const average = values.reduce((sum, value) => sum + value, 0) / windowSize;

    if (
      !bestWindow ||
      (mode === "min" && average < bestWindow.average) ||
      (mode === "max" && average > bestWindow.average)
    ) {
      bestWindow = {
        start,
        end: start + windowSize - 1,
        average,
      };
    }
  }

  return bestWindow;
};

export const buildPeriodSeries = (series, window) => {
  if (!Array.isArray(series)) return [];

  return series.map((item, index) => ({
    ...item,
    price: window && index >= window.start && index <= window.end ? 1 : 0,
  }));
};

export const formatPeriodRange = (series, window) => {
  if (!Array.isArray(series) || !window) return null;

  const startHour = series[window.start]?.hour;
  const endHour = series[window.end]?.hour;

  if (!startHour || !endHour) return null;

  return `${startHour}-${addMinutes(endHour, SLOT_MINUTES)}`;
};