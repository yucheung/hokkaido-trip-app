import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SpotCard } from "@/components/SpotCard";
import { spots, trips } from "@/data";
import { MEAL_ICONS, MEAL_LABELS, mealStatusColor, type MealType } from "@/lib/meal";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

// 行程步驟文字與 Spot.id 之間沒有共通鍵，且原始行程文字用字偶有出入（如「五稜廓」vs 資料中的「五稜郭」），
// 故以人工整理的關鍵字比對步驟文字是否指向 trip.relatedSpotIds 中的某個景點。
const SPOT_STEP_KEYWORDS: Record<string, string[]> = {
  hakodateyama: ["函館山"],
  goryokaku: ["五稜郭", "五稜廓"],
  "hakodate-asaichi": ["函館朝市"],
  "nixe-park": ["尼克斯海洋公園"],
  jigokudani: ["登別地獄谷"],
  "farm-tomita": ["富田花園農場"],
  "shikisai-no-oka": ["四季彩之丘"],
  tanukikoji: ["狸小路"],
  "otaru-canal": ["小樽運河"],
  "showa-shinzan": ["昭和新山", "洞爺熊牧場"],
  "toyako-fireworks": ["洞爺湖花火", "洞爺湖溫泉"],
  "onuma-park": ["大沼公園"],
  kanemori: ["金森倉庫"],
  "trappistine-convent": ["女子修道院"],
};

function findRelatedSpotId(step: string, relatedSpotIds: string[]): string | null {
  for (const spotId of relatedSpotIds) {
    const keywords = SPOT_STEP_KEYWORDS[spotId] ?? [];
    if (keywords.some((keyword) => step.includes(keyword))) {
      return spotId;
    }
  }
  return null;
}

export default function DayDetailScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const trip = trips.find((item) => item.day === Number(day));
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null);

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

  const activeSpot = activeSpotId ? spots.find((spot) => spot.id === activeSpotId) ?? null : null;

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
          {steps.map((step, index) => {
            const relatedSpotId = findRelatedSpotId(step, trip.relatedSpotIds);
            return (
              <View key={`${step}-${index}`} style={styles.stepRow}>
                <View style={styles.stepDot}>
                  <Text style={styles.stepDotText}>{index + 1}</Text>
                </View>
                <View style={styles.stepTextColumn}>
                  <Text style={styles.stepText}>{step}</Text>
                  {relatedSpotId && (
                    <Pressable
                      style={styles.moreInfoButton}
                      onPress={() => setActiveSpotId(relatedSpotId)}
                    >
                      <Text style={styles.moreInfoButtonText}>更多資訊 ›</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
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

      <Modal
        visible={activeSpot !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveSpotId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>景點資訊</Text>
              <Pressable onPress={() => setActiveSpotId(null)} hitSlop={8}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {activeSpot && <SpotCard spot={activeSpot} />}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  stepTextColumn: {
    flex: 1,
    gap: 6,
  },
  stepText: {
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
  },
  moreInfoButton: {
    alignSelf: "flex-start",
  },
  moreInfoButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F1F5F9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalScrollContent: {
    padding: 16,
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
