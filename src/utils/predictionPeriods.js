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

const getWindowStats = (series, windowSize) => {
  if (!Array.isArray(series) || series.length === 0 || windowSize <= 0) {
    return [];
  }

  const values = series.map((item) => Number(item?.price));
  const windows = [];
  let sum = 0;
  let invalidCount = 0;

  for (let idx = 0; idx < values.length; idx += 1) {
    const value = values[idx];

    if (Number.isFinite(value)) {
      sum += value;
    } else {
      invalidCount += 1;
    }

    if (idx >= windowSize) {
      const outgoing = values[idx - windowSize];
      if (Number.isFinite(outgoing)) {
        sum -= outgoing;
      } else {
        invalidCount -= 1;
      }
    }

    if (idx >= windowSize - 1 && invalidCount === 0) {
      windows.push({
        start: idx - windowSize + 1,
        end: idx,
        average: sum / windowSize,
      });
    }
  }

  return windows;
};

const selectBestWindow = (windows, mode) =>
  windows.reduce((best, current) => {
    if (!best) return current;
    if (mode === "min" && current.average < best.average) return current;
    if (mode === "max" && current.average > best.average) return current;
    return best;
  }, null);

const windowsOverlap = (windowA, windowB) => {
  if (!windowA || !windowB) return false;
  return windowA.start <= windowB.end && windowA.end >= windowB.start;
};

export const findBestWindow = (series, windowSize, mode = "min") => {
  const windows = getWindowStats(series, windowSize);
  return selectBestWindow(windows, mode);
};

export const findChargeDischargeWindows = (series, windowSize) => {
  const windows = getWindowStats(series, windowSize);
  if (!windows.length) {
    return { chargeWindow: null, dischargeWindow: null };
  }

  const chargeWindow = selectBestWindow(windows, "min");
  const dischargeCandidates = chargeWindow
    ? windows.filter((window) => !windowsOverlap(window, chargeWindow))
    : windows;
  const dischargeWindow = selectBestWindow(dischargeCandidates, "max");

  return { chargeWindow, dischargeWindow };
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