import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { trips, type Trip } from "@/data";
import { MEAL_ICONS, MEAL_LABELS, mealStatusColor, type MealType } from "@/lib/meal";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

function hotelSummary(hotelOptions: string[]): string {
  if (hotelOptions.length === 0) return "";
  if (hotelOptions.length === 1) return hotelOptions[0];
  return `${hotelOptions[0]} 或 同等級`;
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

function TripCard({ trip }: { trip: Trip }) {
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
        <Text style={styles.dayBadge}>Day {trip.day}</Text>
      </View>
      <Text style={styles.title}>{trip.title}</Text>
      <View style={styles.mealRow}>
        {MEAL_ORDER.map((type) => (
          <MealBadge key={type} type={type} meal={trip.meals[type]} />
        ))}
      </View>
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
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={trips}
      keyExtractor={(item) => String(item.day)}
      renderItem={({ item }) => <TripCard trip={item} />}
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
    alignItems: "center",
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
