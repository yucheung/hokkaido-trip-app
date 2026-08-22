import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import {
  emergencyContacts,
  flights,
  travelNotices,
  type TravelNoticeItem,
} from "@/data";
import { WARNING_COLOR } from "@/lib/meal";

const CATEGORY_ORDER: TravelNoticeItem["category"][] = [
  "行李規定",
  "海關規定",
  "退稅流程",
  "登機須知",
  "打包眉角",
];

const INFO_COLOR = "#2563EB";

function NoticeCard({ item }: { item: TravelNoticeItem }) {
  const isWarning = item.severity === "warning";
  const color = isWarning ? WARNING_COLOR : INFO_COLOR;
  return (
    <View style={[styles.noticeCard, { borderColor: color }]}>
      <Text style={[styles.noticeTitle, { color }]}>
        {isWarning ? "⚠️ " : ""}
        {item.title}
      </Text>
      <View style={styles.noticeDetailList}>
        {item.detail.map((line, index) => (
          <View key={index} style={styles.noticeDetailRow}>
            <Text style={[styles.noticeBullet, { color }]}>•</Text>
            <Text style={styles.noticeDetailText}>{line}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color="#0F172A" />
      </Pressable>
      {expanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function TravelNoticesScreen() {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 航班資訊：固定置頂，不折疊 */}
      <View style={styles.section}>
        <Text style={styles.pinnedSectionTitle}>✈️ 航班資訊</Text>
        <View style={styles.pinnedBody}>
          {flights.map((flight) => (
            <View key={flight.flightNo} style={styles.flightCard}>
              <View style={styles.flightHeaderRow}>
                <Text style={styles.flightDate}>
                  {flight.date}（{flight.weekday}）
                </Text>
                <Text style={styles.flightNo}>{flight.flightNo}</Text>
              </View>
              <Text style={styles.flightRoute}>{flight.route}</Text>
              <Text style={styles.flightMeta}>
                {flight.airline}｜{flight.departTime} → {flight.arriveTime}
              </Text>
              <Text style={styles.flightMeta}>{flight.gateInfo}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 緊急聯絡電話：固定置頂，不折疊 */}
      <View style={styles.section}>
        <Text style={styles.pinnedSectionTitle}>☎️ 緊急聯絡電話</Text>
        <View style={styles.pinnedBody}>
          {emergencyContacts.map((contact) => (
            <View key={contact.name} style={styles.contactRow}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              {contact.note && <Text style={styles.contactNote}>{contact.note}</Text>}
            </View>
          ))}
        </View>
      </View>

      {CATEGORY_ORDER.map((category) => {
        const items = travelNotices.filter((notice) => notice.category === category);
        const expanded = !!expandedCategories[category];
        return (
          <CollapsibleSection
            key={category}
            title={category}
            expanded={expanded}
            onToggle={() => toggleCategory(category)}
          >
            {category === "退稅流程" && (
              <View style={styles.taxBanner}>
                <Text style={styles.taxBannerText}>📌 你們的行程適用現行制度,結帳時當場折抵,2026/11/1 起的新制與此行程無關</Text>
              </View>
            )}
            <View style={styles.noticeCardList}>
              {items.map((item, index) => (
                <NoticeCard key={`${item.title}-${index}`} item={item} />
              ))}
            </View>
          </CollapsibleSection>
        );
      })}
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
    gap: 16,
  },
  section: {
    gap: 10,
  },
  pinnedSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  pinnedBody: {
    gap: 10,
  },
  flightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  flightHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flightDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  flightNo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  flightRoute: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  flightMeta: {
    fontSize: 13,
    color: "#334155",
  },
  contactRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  contactName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  contactPhone: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  contactNote: {
    fontSize: 12,
    color: "#64748B",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionBody: {
    gap: 10,
  },
  taxBanner: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 12,
  },
  taxBannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
    lineHeight: 19,
  },
  noticeCardList: {
    gap: 10,
  },
  noticeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  noticeDetailList: {
    gap: 4,
  },
  noticeDetailRow: {
    flexDirection: "row",
    gap: 6,
  },
  noticeBullet: {
    fontSize: 13,
    fontWeight: "700",
  },
  noticeDetailText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
});
