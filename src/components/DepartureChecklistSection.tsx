import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { departureChecklist } from "@/data";
import type { ChecklistState } from "@/data";

const STORAGE_KEY = "departureChecklistState";

export function DepartureChecklistSection() {
  const [checkedState, setCheckedState] = useState<ChecklistState>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (typeof parsed === "object" && parsed !== null) {
            setCheckedState(
              Object.fromEntries(
                Object.entries(parsed as Record<string, unknown>).map(
                  ([k, v]) => [Number(k), v],
                ),
              ) as ChecklistState,
            );
          }
        } catch {
          // ignore
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checkedState));
    }
  }, [checkedState, loaded]);

  const toggleItem = (index: number) => {
    setCheckedState((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const resetAll = () => {
    setCheckedState({});
  };

  if (!loaded) return null;

  const checkedCount = Object.values(checkedState).filter(Boolean).length;
  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>
        完成 {checkedCount}/{departureChecklist.length} ✓
      </Text>
      {departureChecklist.map((item, index) => {
        const isChecked = !!checkedState[index];
        return (
          <Pressable
            key={index}
            style={styles.row}
            onPress={() => toggleItem(index)}
          >
            <Text style={styles.checkbox}>{isChecked ? "✓" : "○"}</Text>
            <Text
              style={[styles.itemText, isChecked && styles.itemTextChecked]}
            >
              {item.item}
            </Text>
          </Pressable>
        );
      })}
      <Pressable style={styles.resetButton} onPress={resetAll}>
        <Ionicons name="refresh-outline" size={14} color="#64748B" />
        <Text style={styles.resetButtonText}>重置</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    fontSize: 16,
    color: "#2563EB",
    width: 22,
    textAlign: "center",
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  itemTextChecked: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 4,
    paddingVertical: 6,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  resetButtonText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
});
