import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { trips, weatherLocations, type Trip, type WeatherLocation } from "@/data";
import { MEAL_ICONS, MEAL_LABELS, mealStatusColor, type MealType } from "@/lib/meal";
import {
  buildOutfitAdvice,
  describeWeatherCode,
  fetchWeather,
  isForecastStale,
  loadWeatherCache,
  saveWeatherCache,
  type DailyForecast,
  type WeatherCache,
} from "@/lib/weather";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];
const GPS_TIMEOUT_MS = 10000;

function hotelSummary(hotelOptions: string[]): string {
  if (hotelOptions.length === 0) return "";
  if (hotelOptions.length === 1) return hotelOptions[0];
  return `${hotelOptions[0]} 或 同等級`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month}月${date}日 ${hours}:${minutes}`;
}

function MealBadge({ type, meal }: { type: MealType; meal: { label: string; included: boolean } }) {
  const color = mealStatusColor(meal.included);
  return (
    <View style={[styles.mealBadge, { borderColor: color }]}>
      <Ionicons name={MEAL_ICONS[type]} size={14} color={color} />
      <Ionicons
        name={meal.included ? "checkmark-circle" : "close-circle"}
        size={12}
        color={color}
        style={styles.mealBadgeStatusIcon}
      />
      <Text style={[styles.mealBadgeText, { color }]} numberOfLines={1}>
        {meal.included ? MEAL_LABELS[type] : "需自理"}
      </Text>
    </View>
  );
}

interface GpsCardState {
  forecast?: DailyForecast;
  message?: string;
  loading?: boolean;
}

function WeatherBlock({
  location,
  forecast,
  loading,
  cacheReady,
  gps,
  onRefresh,
  onUseGps,
}: {
  location: WeatherLocation | undefined;
  forecast: DailyForecast | undefined;
  loading: boolean;
  cacheReady: boolean;
  gps: GpsCardState | undefined;
  onRefresh: () => void;
  onUseGps: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const effectiveForecast = gps?.forecast ?? forecast;
  const isGpsActive = Boolean(gps?.forecast);
  const gpsLoading = gps?.loading ?? false;
  const showInitialLoading = !cacheReady || (loading && !effectiveForecast);

  return (
    <View style={styles.weatherSection}>
      {showInitialLoading ? (
        <View style={styles.weatherLoadingRow}>
          <ActivityIndicator size="small" color="#64748B" />
          <Text style={styles.weatherLoadingText}>天氣載入中...</Text>
        </View>
      ) : effectiveForecast ? (
        <>
          <View style={styles.weatherMainRow}>
            <View style={styles.weatherLeft}>
              <Ionicons
                name={describeWeatherCode(effectiveForecast.weatherCode).icon}
                size={26}
                color="#334155"
              />
              <Text style={styles.weatherTemp}>
                {Math.round(effectiveForecast.high)}° / {Math.round(effectiveForecast.low)}°
              </Text>
              <Text style={styles.weatherRain}>降雨 {effectiveForecast.precipitationProbability}%</Text>
            </View>
            <View style={styles.weatherActions}>
              <Pressable style={styles.weatherActionButton} onPress={onUseGps} disabled={gpsLoading} hitSlop={8}>
                {gpsLoading ? (
                  <ActivityIndicator size="small" color="#94A3B8" />
                ) : (
                  <Ionicons name="locate-outline" size={16} color="#94A3B8" />
                )}
              </Pressable>
              <Pressable style={styles.weatherActionButton} onPress={onRefresh} disabled={loading} hitSlop={8}>
                {loading ? (
                  <ActivityIndicator size="small" color="#94A3B8" />
                ) : (
                  <Ionicons name="refresh-outline" size={16} color="#94A3B8" />
                )}
              </Pressable>
            </View>
          </View>
          {isGpsActive && (
            <View style={styles.gpsTag}>
              <Ionicons name="location" size={11} color="#2563EB" />
              <Text style={styles.gpsTagText}>目前位置</Text>
            </View>
          )}
          <Pressable
            style={styles.outfitCard}
            onPress={() => setExpanded((v) => !v)}
            accessibilityRole="button"
          >
            <Ionicons name="shirt-outline" size={16} color="#1D4ED8" />
            <View style={styles.outfitTextWrap}>
              {(() => {
                const advice = buildOutfitAdvice(effectiveForecast);
                return (
                  <>
                    <Text style={styles.outfitText}>{advice[0]}</Text>
                    {expanded &&
                      advice.slice(1).map((line) => (
                        <Text key={line} style={styles.outfitText}>
                          {line}
                        </Text>
                      ))}
                  </>
                );
              })()}
            </View>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color="#1D4ED8" />
          </Pressable>
          <Text style={styles.weatherTimestamp}>更新於 {formatTimestamp(effectiveForecast.fetchedAt)}</Text>
        </>
      ) : (
        <View style={styles.weatherEmptyRow}>
          <Text style={styles.weatherEmptyText}>尚無天氣資料,請連網後重新整理</Text>
          <Pressable onPress={onRefresh} disabled={loading} hitSlop={8}>
            {loading ? (
              <ActivityIndicator size="small" color="#94A3B8" />
            ) : (
              <Ionicons name="refresh-outline" size={16} color="#94A3B8" />
            )}
          </Pressable>
        </View>
      )}
      {gps?.message && <Text style={styles.gpsMessage}>{gps.message}</Text>}
      {!location && <Text style={styles.weatherEmptyText}>此日無天氣地點資料</Text>}
    </View>
  );
}

function TripCard({
  trip,
  location,
  forecast,
  loading,
  cacheReady,
  gps,
  onRefresh,
  onUseGps,
}: {
  trip: Trip;
  location: WeatherLocation | undefined;
  forecast: DailyForecast | undefined;
  loading: boolean;
  cacheReady: boolean;
  gps: GpsCardState | undefined;
  onRefresh: () => void;
  onUseGps: () => void;
}) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/day/${trip.day}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>
          {trip.date.slice(5).replace("-", "/")} ({trip.weekday})
        </Text>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.dayBadge}>Day {trip.day}</Text>
          {location && <Text style={styles.locationTag}>{location.location}</Text>}
        </View>
      </View>
      <Text style={styles.title}>{trip.title}</Text>
      <View style={styles.mealRow}>
        {MEAL_ORDER.map((type) => (
          <MealBadge key={type} type={type} meal={trip.meals[type]} />
        ))}
      </View>
      <WeatherBlock
        location={location}
        forecast={forecast}
        loading={loading}
        cacheReady={cacheReady}
        gps={gps}
        onRefresh={onRefresh}
        onUseGps={onUseGps}
      />
      <View style={styles.hotelRow}>
        <Ionicons name="bed-outline" size={16} color="#475569" />
        <Text style={styles.hotelText} numberOfLines={1}>
          {hotelSummary(trip.hotelOptions)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function TodayItineraryScreen() {
  const [cache, setCache] = useState<WeatherCache>({});
  const [cacheReady, setCacheReady] = useState(false);
  const [loadingDays, setLoadingDays] = useState<Record<number, boolean>>({});
  const [gpsState, setGpsState] = useState<Record<number, GpsCardState>>({});
  const cacheRef = useRef<WeatherCache>({});

  const updateCache = useCallback((day: number, forecast: DailyForecast) => {
    cacheRef.current = { ...cacheRef.current, [day]: forecast };
    setCache(cacheRef.current);
    saveWeatherCache(cacheRef.current);
  }, []);

  const fetchDay = useCallback(
    async (location: WeatherLocation) => {
      setLoadingDays((prev) => ({ ...prev, [location.day]: true }));
      try {
        const forecast = await fetchWeather(location.day, location.latitude, location.longitude);
        updateCache(location.day, forecast);
      } catch (error) {
        console.error(`天氣資料抓取失敗 (Day ${location.day})`, error);
      } finally {
        setLoadingDays((prev) => ({ ...prev, [location.day]: false }));
      }
    },
    [updateCache]
  );

  useEffect(() => {
    (async () => {
      const initial = await loadWeatherCache();
      cacheRef.current = initial;
      setCache(initial);
      setCacheReady(true);
      weatherLocations
        .filter((location) => isForecastStale(initial[location.day]))
        .forEach((location) => fetchDay(location));
    })();
  }, [fetchDay]);

  const handleUseGps = useCallback(async (day: number) => {
    setGpsState((prev) => ({ ...prev, [day]: { ...prev[day], loading: true, message: undefined } }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsState((prev) => ({
          ...prev,
          [day]: { loading: false, message: "無法取得目前位置,已顯示行程預設地點天氣" },
        }));
        return;
      }

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("GPS_TIMEOUT")), GPS_TIMEOUT_MS);
      });
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        timeout,
      ]);
      const forecast = await fetchWeather(day, position.coords.latitude, position.coords.longitude);
      setGpsState((prev) => ({ ...prev, [day]: { forecast, loading: false } }));
    } catch (error) {
      console.error(`GPS定位或天氣抓取失敗 (Day ${day})`, error);
      const message =
        error instanceof Error && error.message === "GPS_TIMEOUT"
          ? "定位逾時,顯示預設地點天氣"
          : "無法取得目前位置,已顯示行程預設地點天氣";
      setGpsState((prev) => ({ ...prev, [day]: { loading: false, message } }));
    }
  }, []);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={trips}
      keyExtractor={(item) => String(item.day)}
      renderItem={({ item }) => {
        const location = weatherLocations.find((w) => w.day === item.day);
        return (
          <TripCard
            trip={item}
            location={location}
            forecast={cache[item.day]}
            loading={loadingDays[item.day] ?? false}
            cacheReady={cacheReady}
            gps={gpsState[item.day]}
            onRefresh={() => location && fetchDay(location)}
            onUseGps={() => handleUseGps(item.day)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  dayBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  locationTag: {
    fontSize: 11,
    color: "#94A3B8",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  mealRow: {
    flexDirection: "row",
    gap: 8,
  },
  mealBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  mealBadgeStatusIcon: {
    marginLeft: -1,
  },
  mealBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  weatherSection: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },
  weatherLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  weatherLoadingText: {
    fontSize: 12,
    color: "#64748B",
  },
  weatherMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  weatherRain: {
    fontSize: 12,
    color: "#64748B",
  },
  weatherActions: {
    flexDirection: "row",
    gap: 4,
  },
  weatherActionButton: {
    padding: 4,
  },
  gpsTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
  },
  gpsTagText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
  gpsMessage: {
    fontSize: 11,
    color: "#EA580C",
  },
  outfitCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 8,
  },
  outfitTextWrap: {
    flex: 1,
    gap: 4,
  },
  outfitText: {
    fontSize: 12,
    color: "#1E3A8A",
    lineHeight: 16,
  },
  weatherEmptyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  weatherEmptyText: {
    fontSize: 12,
    color: "#94A3B8",
    flexShrink: 1,
  },
  weatherTimestamp: {
    fontSize: 10,
    color: "#CBD5E1",
  },
  hotelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },
  hotelText: {
    fontSize: 13,
    color: "#475569",
    flexShrink: 1,
  },
});
