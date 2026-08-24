import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "找不到頁面" }} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 18 }}>找不到此頁面</Text>
        <Link href="/" style={{ marginTop: 16, fontSize: 16, color: "#007AFF" }}>
          回到首頁
        </Link>
      </View>
    </>
  );
}
