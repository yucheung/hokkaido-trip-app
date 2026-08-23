import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface DailyForecast {
  day: number;
  fetchedAt: string;
  high: number;
  low: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
  weatherCode: number;
  weatherDescription: string;
}

export type WeatherCache = Record<number, DailyForecast>;

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
  }

  if (forecast.uvIndexMax >= 8) {
    advice.push("務必使用防曬乳、帽子、太陽眼鏡,盡量避免正午長時間曝曬");
  } else if (forecast.uvIndexMax >= 6) {
    advice.push("建議使用防曬乳與帽子");
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

export async function fetchWeather(day: number, latitude: number, longitude: number): Promise<DailyForecast> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
      `&timezone=Asia/Tokyo&forecast_days=1`;

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }
    const json = (await response.json()) as OpenMeteoDailyResponse;
    const weatherCode = json.daily.weather_code[0];

    return {
      day,
      fetchedAt: new Date().toISOString(),
      high: json.daily.temperature_2m_max[0],
      low: json.daily.temperature_2m_min[0],
      precipitationProbability: json.daily.precipitation_probability_max[0],
      windSpeedMax: json.daily.wind_speed_10m_max[0],
      uvIndexMax: json.daily.uv_index_max[0],
      weatherCode,
      weatherDescription: describeWeatherCode(weatherCode).description,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function loadWeatherCache(): Promise<WeatherCache> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as WeatherCache) : {};
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
