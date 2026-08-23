import { StyleSheet, Text, View } from "react-native";
import { englishPhrases } from "@/data";

const CATEGORY_ORDER = ["入境審查", "海關申報", "購物退稅", "一般求助"];

export function EnglishPhraseCard() {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    phrases: englishPhrases.filter((p) => p.category === category),
  })).filter((g) => g.phrases.length > 0);

  return (
    <View style={styles.container}>
      {grouped.map((group) => (
        <View key={group.category} style={styles.categoryGroup}>
          <Text style={styles.categoryTitle}>{group.category}</Text>
          <View style={styles.phraseList}>
            {group.phrases.map((phrase, index) => (
              <View key={index} style={styles.phraseCard}>
                <Text style={styles.english}>{phrase.english}</Text>
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
  english: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  chinese: {
    fontSize: 14,
    color: "#334155",
  },
});
