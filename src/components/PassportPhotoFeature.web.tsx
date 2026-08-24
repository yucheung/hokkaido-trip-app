import { StyleSheet, Text, View } from "react-native";

export type PassportPhotoFeatureProps = {
  photoUri: string | null;
  onPhotoChange: (uri: string | null) => void;
};

export default function PassportPhotoFeature(_props: PassportPhotoFeatureProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>📷 護照照片功能僅 App 版可用</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
});
