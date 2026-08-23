import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  officialCoupons,
  shoppingGuide,
  type ShoppingGuideItem,
} from "@/data";

const LOCATION_ORDER = ["函館", "登別", "富良野美瑛", "札幌", "小樽"];
const CATEGORY_ORDER: ShoppingGuideItem["category"][] = ["藥妝", "3C", "伴手禮"];

function CouponCard({ coupon }: { coupon: (typeof officialCoupons)[number] }) {
  return (
    <View style={styles.couponCard}>
      <View style={styles.couponHeaderRow}>
        <Text style={styles.couponStore}>{coupon.storeName}</Text>
        <Text style={styles.couponDiscount}>{coupon.discount}</Text>
      </View>
      <View style={styles.itemList}>
        {coupon.applicableLocations.map((location, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>{location}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sourceNote}>{coupon.sourceNote}</Text>
    </View>
  );
}

function ShoppingItemCard({ item }: { item: ShoppingGuideItem }) {
  return (
    <View style={styles.shopCard}>
      <Text style={styles.shopStore}>{item.storeName}</Text>
      <View style={styles.itemList}>
        {item.items.map((line, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>{line}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.shopNote}>{item.note}</Text>
    </View>
  );
}

function LocationSection({ location }: { location: string }) {
  const items = shoppingGuide.filter((item) => item.location === location);
  if (items.length === 0) return null;

  return (
    <View style={styles.locationSection}>
      <Text style={styles.locationTitle}>📍 {location}</Text>
      {CATEGORY_ORDER.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.shopCardList}>
              {categoryItems.map((item, index) => (
                <ShoppingItemCard key={`${item.storeName}-${index}`} item={item} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function ShoppingScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎟️ 官方優惠券</Text>
        <View style={styles.couponList}>
          {officialCoupons.map((coupon, index) => (
            <CouponCard key={`${coupon.storeName}-${index}`} coupon={coupon} />
          ))}
        </View>
      </View>

      {LOCATION_ORDER.map((location) => (
        <LocationSection key={location} location={location} />
      ))}
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
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  couponList: {
    gap: 10,
  },
  couponCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    padding: 14,
    gap: 8,
  },
  couponHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  couponStore: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  couponDiscount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B45309",
  },
  sourceNote: {
    fontSize: 11,
    color: "#94A3B8",
    lineHeight: 15,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 6,
  },
  locationSection: {
    gap: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  categorySection: {
    gap: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
  shopCardList: {
    gap: 10,
  },
  shopCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  shopStore: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  shopNote: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
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
    color: "#2563EB",
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
});
