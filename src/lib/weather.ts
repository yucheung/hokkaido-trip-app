import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface DailyForecast {
  day: number;
  date: string;
  fetchedAt: string;
  high: number;
  low: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
  weatherCode: number;
  weatherDescription: string;
}

export type WeatherCache = Record<string, DailyForecast>;

export function weatherCacheKey(day: number, date: string): string {
  return `${day}_${date}`;
}

export class WeatherValidationError extends Error {}

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const CACHE_KEY = "weatherCache";
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

const WMO_TABLE: { codes: number[]; description: string; icon: IoniconName }[] = [
  { codes: [0], description: "晴朗", icon: "sunny" },
  { codes: [1, 2], description: "晴時多雲", icon: "partly-sunny" },
  { codes: [3], description: "多雲", icon: "cloudy" },
  { codes: [45, 48], description: "有霧", icon: "cloud" },
  { codes: [51, 52, 53, 54, 55, 56, 57], description: "毛毛雨", icon: "rainy" },
  { codes: [61, 62, 63, 64, 65, 66, 67], description: "有雨", icon: "rainy" },
  { codes: [71, 72, 73, 74, 75, 76, 77], description: "有雪", icon: "snow" },
  { codes: [80, 81, 82], description: "陣雨", icon: "rainy" },
  { codes: [95, 96, 97, 98, 99], description: "雷雨", icon: "thunderstorm" },
];

const DEFAULT_WEATHER = { description: "天氣多變", icon: "cloud" as IoniconName };

export function describeWeatherCode(code: number): { description: string; icon: IoniconName } {
  const entry = WMO_TABLE.find((e) => e.codes.includes(code));
  return entry ? { description: entry.description, icon: entry.icon } : DEFAULT_WEATHER;
}

export function buildOutfitAdvice(forecast: DailyForecast): string[] {
  const advice: string[] = [];

  if (forecast.high >= 30) {
    advice.push("極輕薄短袖為主,務必加強防曬與補水");
  } else if (forecast.high >= 25) {
    advice.push("短袖即可,早晚溫差大建議備一件薄外套");
  } else if (forecast.high >= 20) {
    advice.push("短袖或薄長袖皆可,建議攜帶薄外套應對早晚與室內冷氣");
  } else if (forecast.high >= 15) {
    advice.push("建議長袖搭配薄外套");
  } else {
    advice.push("建議長袖+保暖外套,必要時加內搭");
  }

  if (forecast.precipitationProbability >= 60) {
    advice.push("建議攜帶雨具,並考慮防水鞋款");
  } else if (forecast.precipitationProbability >= 30) {
    advice.push("建議隨身攜帶輕便雨具備用");
  } else {
    advice.push("不特別需要準備雨具");
  }

  if (forecast.uvIndexMax >= 8) {
    advice.push("務必使用防曬乳、帽子、太陽眼鏡,盡量避免正午長時間曝曬");
  } else if (forecast.uvIndexMax >= 6) {
    advice.push("建議使用防曬乳與帽子");
  } else {
    advice.push("一般防曬即可");
  }

  if (forecast.windSpeedMax >= 40) {
    advice.push("若當天行程含高處景點(如函館山纜車),請特別注意保暖與固定隨身物品");
  }

  return advice;
}

interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    uv_index_max: number[];
  };
}

const DAILY_ARRAY_KEYS = [
  "time",
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "uv_index_max",
] as const;

function isFiniteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;
  return !Number.isNaN(new Date(value).getTime());
}

function validateForecast(json: unknown): asserts json is OpenMeteoDailyResponse {
  if (typeof json !== "object" || json === null || !("daily" in json)) {
    throw new WeatherValidationError("Open-Meteo 回應格式錯誤:缺少 daily");
  }
  const daily = (json as { daily: unknown }).daily;
  if (typeof daily !== "object" || daily === null) {
    throw new WeatherValidationError("Open-Meteo 回應格式錯誤:daily 非物件");
  }
  const d = daily as Record<string, unknown>;
  for (const key of DAILY_ARRAY_KEYS) {
    if (!Array.isArray(d[key])) {
      throw new WeatherValidationError(`Open-Meteo 回應格式錯誤:daily.${key} 非陣列`);
    }
  }
  const length = (d.time as unknown[]).length;
  if (length === 0 || DAILY_ARRAY_KEYS.some((key) => (d[key] as unknown[]).length !== length)) {
    throw new WeatherValidationError("Open-Meteo 回應格式錯誤:daily 陣列長度不一致");
  }
  for (let i = 0; i < length; i++) {
    if (!isValidIsoDate((d.time as unknown[])[i])) {
      throw new WeatherValidationError(`Open-Meteo 回應格式錯誤:time[${i}] 非合法日期`);
    }
    if (
      !isFiniteInRange((d.temperature_2m_max as unknown[])[i], -50, 60) ||
      !isFiniteInRange((d.temperature_2m_min as unknown[])[i], -50, 60)
    ) {
      throw new WeatherValidationError(`Open-Meteo 回應格式錯誤:temperature[${i}] 超出合理範圍`);
    }
    if (!isFiniteInRange((d.precipitation_probability_max as unknown[])[i], 0, 100)) {
      throw new WeatherValidationError(`Open-Meteo 回應格式錯誤:precipitation[${i}] 超出合理範圍`);
    }
    if (!isFiniteInRange((d.uv_index_max as unknown[])[i], 0, 15)) {
      throw new WeatherValidationError(`Open-Meteo 回應格式錯誤:uv_index[${i}] 超出合理範圍`);
    }
    if (!isFiniteInRange((d.wind_speed_10m_max as unknown[])[i], 0, 300)) {
      throw new WeatherValidationError(`Open-Meteo 回應格式錯誤:wind_speed[${i}] 超出合理範圍`);
    }
    if (typeof (d.weather_code as unknown[])[i] !== "number") {
      throw new WeatherValidationError(`Open-Meteo 回應格式錯誤:weather_code[${i}] 非數字`);
    }
  }
}

export async function fetchWeather(
  day: number,
  latitude: number,
  longitude: number,
  tripDate: string,
  externalSignal?: AbortSignal
): Promise<DailyForecast> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
      `&timezone=Asia/Tokyo&start_date=${tripDate}&end_date=${tripDate}`;

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }
    const json: unknown = await response.json();
    validateForecast(json);

    let index = json.daily.time.indexOf(tripDate);
    if (index === -1) {
      console.warn(`fetchWeather: tripDate ${tripDate} 不在回傳的 daily.time 中,改用 index 0`);
      index = 0;
    }
    const weatherCode = json.daily.weather_code[index];

    return {
      day,
      date: tripDate,
      fetchedAt: new Date().toISOString(),
      high: json.daily.temperature_2m_max[index],
      low: json.daily.temperature_2m_min[index],
      precipitationProbability: json.daily.precipitation_probability_max[index],
      windSpeedMax: json.daily.wind_speed_10m_max[index],
      uvIndexMax: json.daily.uv_index_max[index],
      weatherCode,
      weatherDescription: describeWeatherCode(weatherCode).description,
    };
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}

function isValidCacheEntry(value: unknown): value is DailyForecast {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.day === "number" &&
    typeof v.date === "string" &&
    isValidIsoDate(v.fetchedAt) &&
    typeof v.weatherCode === "number" &&
    typeof v.weatherDescription === "string" &&
    Number.isFinite(v.high) &&
    Number.isFinite(v.low) &&
    Number.isFinite(v.precipitationProbability) &&
    Number.isFinite(v.windSpeedMax) &&
    Number.isFinite(v.uvIndexMax)
  );
}

export function validateCache(raw: unknown): WeatherCache {
  if (typeof raw !== "object" || raw === null) return {};
  const result: WeatherCache = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isValidCacheEntry(value)) {
      result[key] = value;
    } else {
      console.warn(`天氣快取項目 ${key} 驗證失敗,已捨棄`);
    }
  }
  return result;
}

export async function loadWeatherCache(): Promise<WeatherCache> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return validateCache(parsed);
  } catch (error) {
    console.error("讀取天氣快取失敗", error);
    return {};
  }
}

export async function saveWeatherCache(cache: WeatherCache): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("寫入天氣快取失敗", error);
  }
}

export function isForecastStale(forecast: DailyForecast | undefined): boolean {
  if (!forecast) return true;
  return Date.now() - new Date(forecast.fetchedAt).getTime() > CACHE_MAX_AGE_MS;
}
