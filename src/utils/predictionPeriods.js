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

const getNumericPrice = (item) => Number(item?.price);

const buildWindowCandidates = (series, windowSize) => {
  if (
    !Array.isArray(series) ||
    series.length === 0 ||
    windowSize <= 0 ||
    windowSize > series.length
  ) {
    return [];
  }

  const windows = [];
  let sum = 0;
  let invalidValues = 0;

  for (let index = 0; index < windowSize; index += 1) {
    const value = getNumericPrice(series[index]);
    if (Number.isFinite(value)) {
      sum += value;
    } else {
      invalidValues += 1;
    }
  }

  if (invalidValues === 0) {
    windows.push({
      start: 0,
      end: windowSize - 1,
      average: sum / windowSize,
    });
  }

  for (let start = 1; start <= series.length - windowSize; start += 1) {
    const outgoing = getNumericPrice(series[start - 1]);
    const incoming = getNumericPrice(series[start + windowSize - 1]);

    if (Number.isFinite(outgoing)) {
      sum -= outgoing;
    } else {
      invalidValues -= 1;
    }

    if (Number.isFinite(incoming)) {
      sum += incoming;
    } else {
      invalidValues += 1;
    }

    if (invalidValues === 0) {
      windows.push({
        start,
        end: start + windowSize - 1,
        average: sum / windowSize,
      });
    }
  }

  return windows;
};

const isBetterWindow = (candidate, current, mode) => {
  if (!current) return true;
  if (candidate.average === current.average) {
    return candidate.start < current.start;
  }
  return mode === "min"
    ? candidate.average < current.average
    : candidate.average > current.average;
};

const windowsDoNotOverlap = (firstWindow, secondWindow) =>
  firstWindow.end < secondWindow.start || secondWindow.end < firstWindow.start;

const isBetterWindowPair = (candidatePair, currentPair) => {
  if (!currentPair) return true;

  if (candidatePair.chargeWindow.average !== currentPair.chargeWindow.average) {
    return candidatePair.chargeWindow.average < currentPair.chargeWindow.average;
  }

  if (
    candidatePair.dischargeWindow.average !== currentPair.dischargeWindow.average
  ) {
    return (
      candidatePair.dischargeWindow.average >
      currentPair.dischargeWindow.average
    );
  }

  const candidateSpread =
    candidatePair.dischargeWindow.average - candidatePair.chargeWindow.average;
  const currentSpread =
    currentPair.dischargeWindow.average - currentPair.chargeWindow.average;

  if (candidateSpread !== currentSpread) {
    return candidateSpread > currentSpread;
  }

  if (
    candidatePair.chargeWindow.start !== currentPair.chargeWindow.start
  ) {
    return candidatePair.chargeWindow.start < currentPair.chargeWindow.start;
  }

  return (
    candidatePair.dischargeWindow.start < currentPair.dischargeWindow.start
  );
};

export const findBestWindow = (series, windowSize, mode = "min") =>
  buildWindowCandidates(series, windowSize).reduce(
    (bestWindow, candidate) =>
      isBetterWindow(candidate, bestWindow, mode) ? candidate : bestWindow,
    null,
  );

export const findBestWindowPair = (series, windowSize) => {
  const windows = buildWindowCandidates(series, windowSize);

  if (!windows.length) {
    return {
      chargeWindow: null,
      dischargeWindow: null,
    };
  }

  let bestPair = null;

  windows.forEach((chargeWindow) => {
    windows.forEach((dischargeWindow) => {
      if (!windowsDoNotOverlap(chargeWindow, dischargeWindow)) return;

      const candidatePair = { chargeWindow, dischargeWindow };
      if (isBetterWindowPair(candidatePair, bestPair)) {
        bestPair = candidatePair;
      }
    });
  });

  if (bestPair) return bestPair;

  return {
    chargeWindow: findBestWindow(series, windowSize, "min"),
    dischargeWindow: null,
  };
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