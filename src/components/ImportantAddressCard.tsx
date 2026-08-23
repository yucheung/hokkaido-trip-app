import { StyleSheet, Text, View } from "react-native";
import { importantAddresses, hotelAddressNote } from "@/data";

export function ImportantAddressCard() {
  return (
    <View style={styles.container}>
      {importantAddresses.map((address, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.name}>{address.name}</Text>
          <Text style={styles.japaneseAddress}>{address.japaneseAddress}</Text>
          <Text style={styles.phone}>{address.phone}</Text>
          {address.note ? (
            <Text style={styles.note}>{address.note}</Text>
          ) : null}
        </View>
      ))}
      {hotelAddressNote ? (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>{hotelAddressNote}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  japaneseAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 22,
  },
  phone: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  note: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  infoBanner: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 12,
  },
  infoBannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
    lineHeight: 19,
  },
});
