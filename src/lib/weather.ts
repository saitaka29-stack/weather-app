// OpenWeatherMap のレスポンスを、画面で使いやすい形に変換する処理と型定義。

export type Location = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezoneOffset: number; // UTC からのずれ（秒）
};

export type CurrentWeather = {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  pop: number | null; // 直近 3 時間の降水確率（0〜1）
};

export type HourlyForecast = {
  time: string; // 現地時刻 "HH:MM"
  temp: number;
  humidity: number;
  pop: number;
  description: string;
  icon: string;
};

export type DailyForecast = {
  date: string; // 現地日付 "YYYY-MM-DD"
  tempMin: number;
  tempMax: number;
  humidity: number; // 平均
  pop: number; // その日の最大降水確率
  windSpeed: number; // 最大
  description: string;
  icon: string;
  hourly: HourlyForecast[];
};

export type WeatherResponse = {
  location: Location;
  current: CurrentWeather;
  daily: DailyForecast[];
};

// --- OpenWeatherMap の生データ型（使う項目だけ） ---

type OwmCondition = { description: string; icon: string };

export type OwmCurrent = {
  name: string;
  sys: { country: string };
  coord: { lat: number; lon: number };
  timezone: number;
  main: { temp: number; feels_like: number; humidity: number };
  weather: OwmCondition[];
  wind: { speed: number };
};

export type OwmForecast = {
  city: {
    name: string;
    country: string;
    coord: { lat: number; lon: number };
    timezone: number;
  };
  list: {
    dt: number;
    main: { temp: number; temp_min: number; temp_max: number; humidity: number };
    weather: OwmCondition[];
    wind: { speed: number };
    pop: number;
  }[];
};

/** UNIX 秒 + タイムゾーン補正 → 現地の "YYYY-MM-DD" と "HH:MM" */
export function toLocalParts(dt: number, offsetSec: number) {
  const iso = new Date((dt + offsetSec) * 1000).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/** 3 時間ごとの予報を、現地日付ごとの 1 日の予報にまとめる */
export function groupByDay(forecast: OwmForecast): DailyForecast[] {
  const offset = forecast.city.timezone;
  const days = new Map<string, OwmForecast["list"]>();

  for (const item of forecast.list) {
    const { date } = toLocalParts(item.dt, offset);
    if (!days.has(date)) days.set(date, []);
    days.get(date)!.push(item);
  }

  return [...days.entries()].map(([date, items]) => {
    // 代表の天気は 12 時に一番近い時間帯のものを使う
    const noon = items.reduce((best, item) => {
      const hour = Number(toLocalParts(item.dt, offset).time.slice(0, 2));
      const bestHour = Number(toLocalParts(best.dt, offset).time.slice(0, 2));
      return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? item : best;
    });

    return {
      date,
      tempMin: Math.min(...items.map((i) => i.main.temp_min)),
      tempMax: Math.max(...items.map((i) => i.main.temp_max)),
      humidity: Math.round(
        items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length,
      ),
      pop: Math.max(...items.map((i) => i.pop)),
      windSpeed: Math.max(...items.map((i) => i.wind.speed)),
      description: noon.weather[0]?.description ?? "",
      icon: noon.weather[0]?.icon ?? "01d",
      hourly: items.map((i) => ({
        time: toLocalParts(i.dt, offset).time,
        temp: i.main.temp,
        humidity: i.main.humidity,
        pop: i.pop,
        description: i.weather[0]?.description ?? "",
        icon: i.weather[0]?.icon ?? "01d",
      })),
    };
  });
}

export function buildResponse(
  current: OwmCurrent,
  forecast: OwmForecast,
  displayName?: string,
): WeatherResponse {
  return {
    location: {
      name: displayName ?? current.name,
      country: current.sys.country,
      lat: current.coord.lat,
      lon: current.coord.lon,
      timezoneOffset: current.timezone,
    },
    current: {
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      description: current.weather[0]?.description ?? "",
      icon: current.weather[0]?.icon ?? "01d",
      windSpeed: current.wind.speed,
      pop: forecast.list[0]?.pop ?? null,
    },
    daily: groupByDay(forecast),
  };
}
