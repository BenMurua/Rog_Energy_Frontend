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

const parseMinutesFromHour = (hour) => {
  if (typeof hour !== "string") return null;
  const [hh, mm] = hour.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
};

export const getWindowSizeFromSeries = (duration, series) => {
  const hours = Number.parseInt(duration, 10);
  if (!Number.isFinite(hours) || hours <= 0) return 0;

  const minutes = series
    .map((item) => parseMinutesFromHour(item?.hour))
    .filter((value) => Number.isFinite(value));

  if (minutes.length >= 2) {
    const uniqueMinutes = Array.from(new Set(minutes)).sort((a, b) => a - b);
    let step = null;

    for (let idx = 1; idx < uniqueMinutes.length; idx += 1) {
      const delta = uniqueMinutes[idx] - uniqueMinutes[idx - 1];
      if (delta > 0) {
        step = step == null ? delta : Math.min(step, delta);
      }
    }

    const resolvedStep = step || SLOT_MINUTES;
    return Math.max(1, Math.round((hours * 60) / resolvedStep));
  }

  return Math.max(1, Math.round((hours * 60) / SLOT_MINUTES));
};

const buildWindowSummaries = (series, windowSize) => {
  if (!Array.isArray(series) || series.length === 0 || windowSize <= 0) {
    return [];
  }

  const values = series.map((item) => Number(item?.price));
  const sumPrefix = [0];
  const validPrefix = [0];

  values.forEach((value) => {
    const lastSum = sumPrefix[sumPrefix.length - 1];
    const lastValid = validPrefix[validPrefix.length - 1];

    sumPrefix.push(lastSum + (Number.isFinite(value) ? value : 0));
    validPrefix.push(lastValid + (Number.isFinite(value) ? 1 : 0));
  });

  const windows = [];

  for (let start = 0; start <= series.length - windowSize; start += 1) {
    const end = start + windowSize - 1;
    const validCount = validPrefix[end + 1] - validPrefix[start];

    if (validCount !== windowSize) continue;

    const sum = sumPrefix[end + 1] - sumPrefix[start];
    windows.push({
      start,
      end,
      sum,
      average: sum / windowSize,
    });
  }

  return windows;
};

const pickBestWindow = (windows, mode) => {
  if (!windows.length) return null;

  return windows.reduce((best, current) => {
    if (!best) return current;
    if (mode === "min") return current.average < best.average ? current : best;
    return current.average > best.average ? current : best;
  }, null);
};

export const findOptimalNonOverlappingWindows = (series, windowSize) => {
  const windows = buildWindowSummaries(series, windowSize);

  if (!windows.length) {
    return { chargeWindow: null, dischargeWindow: null };
  }

  let bestPair = null;

  windows.forEach((chargeWindow) => {
    windows.forEach((dischargeWindow) => {
      const overlaps =
        chargeWindow.start <= dischargeWindow.end &&
        dischargeWindow.start <= chargeWindow.end;

      if (overlaps) return;

      const spread = dischargeWindow.average - chargeWindow.average;

      if (
        !bestPair ||
        spread > bestPair.spread ||
        (spread === bestPair.spread && chargeWindow.average < bestPair.chargeWindow.average) ||
        (spread === bestPair.spread &&
          chargeWindow.average === bestPair.chargeWindow.average &&
          dischargeWindow.average > bestPair.dischargeWindow.average)
      ) {
        bestPair = {
          chargeWindow,
          dischargeWindow,
          spread,
        };
      }
    });
  });

  if (bestPair) {
    return bestPair;
  }

  const bestCharge = pickBestWindow(windows, "min");
  const bestDischarge = pickBestWindow(windows, "max");

  const availableForDischarge = windows.filter(
    (window) =>
      bestCharge &&
      (window.end < bestCharge.start || window.start > bestCharge.end),
  );
  const dischargeFromCharge = pickBestWindow(availableForDischarge, "max");

  if (bestCharge && dischargeFromCharge) {
    return { chargeWindow: bestCharge, dischargeWindow: dischargeFromCharge };
  }

  const availableForCharge = windows.filter(
    (window) =>
      bestDischarge &&
      (window.end < bestDischarge.start || window.start > bestDischarge.end),
  );
  const chargeFromDischarge = pickBestWindow(availableForCharge, "min");

  if (chargeFromDischarge && bestDischarge) {
    return { chargeWindow: chargeFromDischarge, dischargeWindow: bestDischarge };
  }

  return { chargeWindow: bestCharge, dischargeWindow: null };
};

const sortByValue = (a, b, mode) =>
  mode === "min" ? a.value - b.value : b.value - a.value;

export const findBestPoints = (series, count, mode = "min") => {
  if (!Array.isArray(series) || series.length === 0 || count <= 0) {
    return [];
  }

  const candidates = series
    .map((item, index) => ({
      index,
      value: Number(item?.price),
    }))
    .filter((item) => Number.isFinite(item.value));

  candidates.sort((a, b) => sortByValue(a, b, mode));
  return candidates.slice(0, count).map((item) => item.index);
};

export const findBestChargeDischargePoints = (series, count) => {
  const chargePoints = findBestPoints(series, count, "min");
  const chargeSet = new Set(chargePoints);
  const remaining = series.filter((_, index) => !chargeSet.has(index));
  const offsetMap = series.reduce((acc, _, idx) => {
    if (!chargeSet.has(idx)) acc.push(idx);
    return acc;
  }, []);

  const dischargePointsRaw = findBestPoints(remaining, count, "max");
  const dischargePoints = dischargePointsRaw.map((idx) => offsetMap[idx]);

  return { chargePoints, dischargePoints };
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

export const buildPointsSeries = (series, points = []) => {
  if (!Array.isArray(series)) return [];
  const pointSet = new Set(points);

  return series.map((item, index) => ({
    ...item,
    price: pointSet.has(index) ? 1 : 0,
  }));
};