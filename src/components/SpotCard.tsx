import { Image, StyleSheet, Text, View } from "react-native";

import type { Spot } from "@/data";
import { spotImages } from "@/data";

function SpotSection({
  icon,
  title,
  items,
}: {
  icon: string;
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {icon} {title}
      </Text>
      <View style={styles.itemList}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SpotCard({ spot }: { spot: Spot }) {
  const image = spotImages[spot.id];
  return (
    <View style={styles.card}>
      {image ? (
        <Image source={image} style={styles.cover} resizeMode="cover" />
      ) : null}
      <View style={styles.body}>
        <Text style={styles.name}>{spot.name}</Text>
        <Text style={styles.tagline}>{spot.tagline}</Text>
        <SpotSection icon="🍡" title="推薦美食" items={spot.mustEat} />
        <SpotSection icon="📸" title="拍照/看點建議" items={spot.mustSee} />
        <SpotSection icon="💡" title="小提醒" items={spot.tips} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cover: {
    width: "100%",
    height: 180,
    backgroundColor: "#EDE9FE",
  },
  body: {
    padding: 16,
    gap: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  tagline: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  itemList: {
    gap: 4,
  },
  itemRow: {
    flexDirection: "row",
    gap: 6,
  },
  bullet: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7C3AED",
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
  },
});
