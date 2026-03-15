const HOURS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);
const SESSION_IDS = ["ID1", "ID2", "ID3", "ID4", "ID5", "ID6"];

const seeded = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const toDate = (value) => new Date(`${value}T00:00:00`);

const formatDate = (date) => date.toISOString().slice(0, 10);

const getDateRange = (start, end) => {
  const startDate = toDate(start);
  const endDate = toDate(end);
  const dates = [];

  for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
    dates.push(formatDate(current));
  }

  return dates;
};

const baseDailyPrice = (hour, dayIndex = 0, offset = 0) => {
  const peak = Math.sin(((hour - 7) / 24) * Math.PI * 2) * 16;
  const evening = Math.cos(((hour - 19) / 24) * Math.PI * 2) * 9;
  const volatility = (seeded(hour * 13 + dayIndex * 17 + offset) - 0.5) * 8;
  return Number((56 + peak + evening + volatility).toFixed(2));
};

const withNoise = (value, seed) => Number((value + (seeded(seed) - 0.5) * 6).toFixed(2));

const getDailyCurve = (dayIndex = 0, offset = 0) =>
  HOURS.map((hourLabel, hourIndex) => ({
    hour: hourLabel,
    price: baseDailyPrice(hourIndex, dayIndex, offset),
  }));

export function generatePredictionIntradayMockData(sessionId) {
  const sessionIndex = SESSION_IDS.indexOf(sessionId);
  const offset = sessionIndex * 6;
  const base = getDailyCurve(0, offset);

  const price = base.map((point, index) => ({
    hour: point.hour,
    price: withNoise(point.price, index + offset + 3),
  }));

  const realPrice = price.map((point, index) => ({
    hour: point.hour,
    price: withNoise(point.price, index + offset + 97),
  }));

  return {
    price,
    realPrice,
    table: price.map((point, index) => ({
      hour: point.hour,
      predicted: point.price,
      real: realPrice[index].price,
    })),
  };
}

export function generateHistoricDailyMockData(start, end) {
  const dates = getDateRange(start, end);
  const curvesByDate = {};
  const realCurvesByDate = {};

  dates.forEach((date, index) => {
    const predictedCurve = getDailyCurve(index);
    const realCurve = predictedCurve.map((point, hourIndex) => ({
      hour: point.hour,
      price: withNoise(point.price, index * 37 + hourIndex * 11 + 211),
    }));

    curvesByDate[date] = predictedCurve;
    realCurvesByDate[date] = realCurve;
  });

  const chartData = HOURS.map((hourLabel, hourIndex) => {
    const row = { hour: hourLabel, average: 0, averagePredicted: 0 };
    dates.forEach((date) => {
      const value = curvesByDate[date][hourIndex].price;
      row[date] = value;
      row.average += value;
      row.averagePredicted += value;
    });

    row.average = Number((row.average / Math.max(dates.length, 1)).toFixed(2));
    row.averagePredicted = Number((row.averagePredicted / Math.max(dates.length, 1)).toFixed(2));
    return row;
  });

  const chartDataReal = HOURS.map((hourLabel, hourIndex) => {
    const row = { hour: hourLabel, averageReal: 0 };

    dates.forEach((date) => {
      const value = realCurvesByDate[date][hourIndex].price;
      row[date] = value;
      row.averageReal += value;
    });

    row.averageReal = Number((row.averageReal / Math.max(dates.length, 1)).toFixed(2));
    return row;
  });

  const summary = dates.map((date) => {
    const pricesPredicted = curvesByDate[date].map((item) => item.price);
    const pricesReal = realCurvesByDate[date].map((item) => item.price);
    const min = Math.min(...pricesPredicted);
    const max = Math.max(...pricesPredicted);
    const mean = pricesPredicted.reduce((sum, value) => sum + value, 0) / pricesPredicted.length;
    const negativeHours = pricesPredicted.filter((value) => value < 0).length;
    const minReal = Math.min(...pricesReal);
    const maxReal = Math.max(...pricesReal);
    const meanReal = pricesReal.reduce((sum, value) => sum + value, 0) / pricesReal.length;
    const negativeHoursReal = pricesReal.filter((value) => value < 0).length;

    return {
      date,
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      mean: Number(mean.toFixed(2)),
      negativeHours,
      minReal: Number(minReal.toFixed(2)),
      maxReal: Number(maxReal.toFixed(2)),
      meanReal: Number(meanReal.toFixed(2)),
      negativeHoursReal,
    };
  });

  return { dates, chartData, chartDataReal, summary };
}

export function generateHistoricIntradayMockData(start, end, sessionId) {
  const base = generateHistoricDailyMockData(start, end);
  const sessionFactor = SESSION_IDS.indexOf(sessionId) + 1;

  const chartData = base.chartData.map((row) => {
    const transformed = {
      hour: row.hour,
      average: Number((row.average + sessionFactor * 0.9).toFixed(2)),
      averagePredicted: Number((row.averagePredicted + sessionFactor * 0.9).toFixed(2)),
    };

    base.dates.forEach((date, dateIndex) => {
      transformed[date] = Number((row[date] + Math.sin(dateIndex + sessionFactor) * 2.1).toFixed(2));
    });

    return transformed;
  });

  const chartDataReal = base.chartDataReal.map((row) => {
    const transformed = {
      hour: row.hour,
      averageReal: Number((row.averageReal + sessionFactor * 0.7).toFixed(2)),
    };

    base.dates.forEach((date, dateIndex) => {
      transformed[date] = Number((row[date] + Math.cos(dateIndex + sessionFactor) * 1.8).toFixed(2));
    });

    return transformed;
  });

  const summary = base.summary.map((item) => ({
    ...item,
    min: Number((item.min + sessionFactor * 0.8).toFixed(2)),
    max: Number((item.max + sessionFactor * 0.8).toFixed(2)),
    mean: Number((item.mean + sessionFactor * 0.8).toFixed(2)),
    minReal: Number((item.minReal + sessionFactor * 0.6).toFixed(2)),
    maxReal: Number((item.maxReal + sessionFactor * 0.6).toFixed(2)),
    meanReal: Number((item.meanReal + sessionFactor * 0.6).toFixed(2)),
    session: sessionId,
  }));

  return {
    ...base,
    chartData,
    chartDataReal,
    summary,
  };
}

export function generateStatisticsDailyMockData(start, end) {
  const historic = generateHistoricDailyMockData(start, end);
  const allValues = historic.chartData.flatMap((row) =>
    historic.dates.map((date) => row[date]),
  );

  const averagePrice = allValues.reduce((sum, value) => sum + value, 0) / allValues.length;
  const maxPrice = Math.max(...allValues);
  const minPrice = Math.min(...allValues);
  const negativeRate = (allValues.filter((value) => value < 0).length / allValues.length) * 100;

  const minOverall = Math.min(...allValues);
  const maxOverall = Math.max(...allValues);
  const BIN_SIZE = 10;
  const bins = [];

  for (let current = Math.floor(minOverall / BIN_SIZE) * BIN_SIZE; current <= maxOverall; current += BIN_SIZE) {
    const next = current + BIN_SIZE;
    bins.push({
      label: `${current} a ${next}`,
      count: allValues.filter((value) => value >= current && value < next).length,
    });
  }

  const monthlyMap = new Map();

  historic.dates.forEach((date) => {
    const month = date.slice(0, 7);
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, []);
    }

    HOURS.forEach((_, hourIndex) => {
      monthlyMap.get(month).push(historic.chartData[hourIndex][date]);
    });
  });

  const monthlyRanges = Array.from(monthlyMap.entries()).map(([month, values]) => ({
    month,
    min: Number(Math.min(...values).toFixed(2)),
    max: Number(Math.max(...values).toFixed(2)),
    avg: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
  }));

  return {
    kpis: {
      averagePrice: Number(averagePrice.toFixed(2)),
      maxPrice: Number(maxPrice.toFixed(2)),
      minPrice: Number(minPrice.toFixed(2)),
      negativeRate: Number(negativeRate.toFixed(2)),
    },
    histogram: bins,
    monthlyRanges,
  };
}

export function generateStatisticsIntradayMockData(start, end, selectedSession = "ID1") {
  const base = generateStatisticsDailyMockData(start, end);
  const sessionShift = SESSION_IDS.indexOf(selectedSession) + 1;

  const comparisonDate = end;
  const comparisonSeries = SESSION_IDS.map((session, index) => {
    const mock = generatePredictionIntradayMockData(session);
    return {
      session,
      values: mock.price.map((point) => ({
        hour: point.hour,
        price: Number((point.price + (index - sessionShift) * 1.4).toFixed(2)),
      })),
    };
  });

  return {
    ...base,
    comparisonDate,
    comparisonSeries,
  };
}

export function generateConsumptionForecastVsRealMockData(date) {
  const series = HOURS.map((hourLabel, hourIndex) => {
    const forecast = Number((29500 + Math.sin((hourIndex / 24) * Math.PI * 2) * 3200 + hourIndex * 12).toFixed(2));
    const real = Number((forecast + Math.cos(((hourIndex + 2) / 24) * Math.PI * 2) * 850).toFixed(2));
    const error = Math.abs(forecast - real);

    return {
      date,
      hour: hourLabel,
      forecast,
      real,
      error,
      ape: real !== 0 ? (error / Math.abs(real)) * 100 : 0,
    };
  });

  const mae = series.reduce((sum, item) => sum + item.error, 0) / series.length;
  const mape = series.reduce((sum, item) => sum + item.ape, 0) / series.length;

  return {
    series,
    mae: Number(mae.toFixed(2)),
    mape: Number(mape.toFixed(2)),
  };
}

export function generateOmieHeatmapMockData(year, month) {
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0));
  const rows = [];

  for (let day = 1; day <= monthEnd.getUTCDate(); day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hourlyValues = HOURS.map((_, hourIndex) =>
      Number((48 + Math.sin((hourIndex / 24) * Math.PI * 2) * 12 + seeded(day * 71 + hourIndex * 19) * 9).toFixed(2)),
    );

    rows.push({ date, hourlyValues });
  }

  return {
    startDate: formatDate(monthStart),
    endDate: formatDate(monthEnd),
    rows,
  };
}

export function generateMibelFuturesMockData() {
  const contracts = ["M+1", "Q+1", "Y+1"];
  const today = new Date();

  const timeline = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));

    const row = { date: formatDate(date) };
    contracts.forEach((contract, contractIndex) => {
      const base = 60 + contractIndex * 5;
      row[contract] = Number((base + Math.sin((index / 29) * Math.PI * 2 + contractIndex) * 6 + seeded(index * 11 + contractIndex * 7) * 3).toFixed(2));
    });

    return row;
  });

  const latest = timeline[timeline.length - 1];
  const previousDay = timeline[timeline.length - 2];
  const previousWeek = timeline[timeline.length - 8];

  const table = contracts.map((contract, index) => ({
    contract,
    currentPrice: latest[contract],
    dayVariation: Number((latest[contract] - previousDay[contract]).toFixed(2)),
    weekVariation: Number((latest[contract] - previousWeek[contract]).toFixed(2)),
    expiryDate: new Date(today.getFullYear(), today.getMonth() + (index + 1) * 3, 1).toISOString().slice(0, 10),
  }));

  return { timeline, table };
}

export function generateReservoirLevelMockData(rangeKey) {
  const weekCountByRange = {
    "6m": 26,
    "1y": 52,
    "2y": 104,
  };
  const points = weekCountByRange[rangeKey] || 52;
  const today = new Date();

  const series = Array.from({ length: points }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (points - 1 - index) * 7);

    const level = Number((10500 + Math.sin((index / points) * Math.PI * 2) * 1500 + seeded(index * 37) * 650).toFixed(2));
    const historicalAverage = Number((9800 + Math.cos((index / points) * Math.PI * 2) * 700).toFixed(2));

    return {
      date: formatDate(date),
      level,
      historicalAverage,
    };
  });

  const current = series[series.length - 1];
  const mean = series.reduce((sum, item) => sum + item.historicalAverage, 0) / series.length;
  const lastYearReference = series[Math.max(series.length - 53, 0)].level;

  return {
    series,
    kpis: {
      currentLevel: current.level,
      diffVsAverage: Number((((current.level - mean) / mean) * 100).toFixed(2)),
      diffVsLastYear: Number((((current.level - lastYearReference) / lastYearReference) * 100).toFixed(2)),
      mean: Number(mean.toFixed(2)),
    },
  };
}

export { HOURS, SESSION_IDS };
