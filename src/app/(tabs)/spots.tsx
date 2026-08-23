import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { SpotCard } from "@/components/SpotCard";
import { spots } from "@/data";

const DAYS = [1, 2, 3, 4, 5];

export default function SpotsScreen() {
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchesDay = selectedDay === null || spot.day.includes(selectedDay);
      const matchesQuery =
        query.trim().length === 0 || spot.name.includes(query.trim());
      return matchesDay && matchesQuery;
    });
  }, [query, selectedDay]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜尋景點名稱"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.dayFilterRow}>
        <Pressable
          style={[styles.dayChip, selectedDay === null && styles.dayChipActive]}
          onPress={() => setSelectedDay(null)}
        >
          <Text style={[styles.dayChipText, selectedDay === null && styles.dayChipTextActive]}>
            全部
          </Text>
        </Pressable>
        {DAYS.map((day) => (
          <Pressable
            key={day}
            style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
            onPress={() => setSelectedDay(selectedDay === day ? null : day)}
          >
            <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
              Day {day}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filteredSpots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SpotCard spot={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>沒有符合條件的景點</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 16,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  dayFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
  dayChipActive: {
    backgroundColor: "#7C3AED",
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  dayChipTextActive: {
    color: "#FFFFFF",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#94A3B8",
    fontSize: 14,
  },
});
