import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { trips } from "@/data";
import { MEAL_ICONS, MEAL_LABELS, mealStatusColor, type MealType } from "@/lib/meal";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

export default function DayDetailScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const trip = trips.find((item) => item.day === Number(day));

  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Text>找不到此日行程</Text>
      </View>
    );
  }

  const steps = trip.fullItinerary
    .split("→")
    .map((step) => step.trim())
    .filter((step) => step.length > 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{ title: `Day ${trip.day} · ${trip.date.slice(5).replace("-", "/")}` }}
      />

      <View style={styles.header}>
        <Text style={styles.dateText}>
          {trip.date.slice(5).replace("-", "/")} ({trip.weekday}) · Day {trip.day}
        </Text>
        <Text style={styles.title}>{trip.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>完整行程</Text>
        <View style={styles.stepList}>
          {steps.map((step, index) => (
            <View key={`${step}-${index}`} style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepDotText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>餐食</Text>
        <View style={styles.mealCards}>
          {MEAL_ORDER.map((type) => {
            const meal = trip.meals[type];
            const color = mealStatusColor(meal.included);
            return (
              <View key={type} style={[styles.mealCard, { borderColor: color }]}>
                <View style={styles.mealCardHeader}>
                  <Ionicons name={MEAL_ICONS[type]} size={18} color={color} />
                  <Text style={[styles.mealCardTitle, { color }]}>{MEAL_LABELS[type]}</Text>
                  <Ionicons
                    name={meal.included ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={color}
                  />
                </View>
                <Text style={styles.mealCardLabel}>
                  {meal.included ? meal.label : `需自理（${meal.label}）`}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>住宿</Text>
        <View style={styles.hotelCard}>
          {trip.hotelOptions.map((hotel) => (
            <View key={hotel} style={styles.hotelChip}>
              <Ionicons name="bed-outline" size={14} color="#475569" />
              <Text style={styles.hotelChipText}>{hotel}</Text>
            </View>
          ))}
          {trip.hotelPhone.length > 0 && (
            <View style={styles.hotelPhoneRow}>
              <Ionicons name="call-outline" size={14} color="#475569" />
              <Text style={styles.hotelPhoneText}>{trip.hotelPhone}（純顯示，不可撥號）</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  content: {
    padding: 16,
    gap: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  stepList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
  },
  mealCards: {
    gap: 10,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    gap: 6,
  },
  mealCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mealCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  mealCardLabel: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  hotelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  hotelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hotelChipText: {
    fontSize: 14,
    color: "#1E293B",
  },
  hotelPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },
  hotelPhoneText: {
    fontSize: 13,
    color: "#64748B",
  },
});
