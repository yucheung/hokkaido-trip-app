import { StyleSheet, Text, View } from "react-native";
import { japanesePhrases } from "@/data";

const CATEGORY_ORDER = ["緊急求助", "日常詢問", "購物"];

const CATEGORY_ACCENT: Record<string, string> = {
  緊急求助: "#EF4444",
  日常詢問: "#2563EB",
  購物: "#16A34A",
};

export function JapanesePhraseCard() {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    phrases: japanesePhrases.filter((p) => p.category === category),
  })).filter((g) => g.phrases.length > 0);

  return (
    <View style={styles.container}>
      {grouped.map((group) => (
        <View key={group.category} style={styles.categoryGroup}>
          <View style={styles.categoryHeader}>
            <View
              style={[
                styles.categoryAccent,
                { backgroundColor: CATEGORY_ACCENT[group.category] ?? "#64748B" },
              ]}
            />
            <Text style={styles.categoryTitle}>{group.category}</Text>
          </View>
          <View style={styles.phraseList}>
            {group.phrases.map((phrase, index) => (
              <View key={index} style={styles.phraseCard}>
                <Text style={styles.japanese}>{phrase.japanese}</Text>
                <Text style={styles.romaji}>{phrase.romaji}</Text>
                <Text style={styles.chinese}>{phrase.chinese}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  categoryGroup: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryAccent: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  phraseList: {
    gap: 6,
  },
  phraseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  japanese: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  romaji: {
    fontSize: 14,
    color: "#64748B",
  },
  chinese: {
    fontSize: 13,
    color: "#334155",
  },
});
