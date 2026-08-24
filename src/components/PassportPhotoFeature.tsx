import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { copyAsync } from "expo-file-system/legacy";
import * as LocalAuthentication from "expo-local-authentication";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  PASSPORT_PHOTOS_DIR,
  ensurePassportDir,
  deletePassportPhoto,
} from "@/lib/passport-photo";

export type PassportPhotoFeatureProps = {
  photoUri: string | null;
  onPhotoChange: (uri: string | null) => void;
};

export default function PassportPhotoFeature({
  photoUri,
  onPhotoChange,
}: PassportPhotoFeatureProps) {
  const [showPhoto, setShowPhoto] = useState(false);

  // Note: On iOS, UIImagePickerController does NOT auto-save to Camera Roll.
  // On Android, launchCameraAsync saves to Gallery automatically.
  // This app targets iOS only. If Android support is needed, use expo-camera CameraView instead.
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("需要相機權限", "請在設定中允許相機存取權限");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return;
      const sourceUri = result.assets[0].uri;
      await ensurePassportDir();
      const filename = `passport_${Date.now()}.jpg`;
      const destUri = `${PASSPORT_PHOTOS_DIR}${filename}`;
      await copyAsync({ from: sourceUri, to: destUri });
      if (photoUri) {
        await deletePassportPhoto(photoUri);
      }
      onPhotoChange(destUri);
    } catch (error) {
      console.error("拍照失敗", error);
      Alert.alert("錯誤", "拍照操作失敗,請稍後再試");
    }
  };

  // Note: On iOS, UIImagePickerController does NOT auto-save to Camera Roll.
  // On Android, launchCameraAsync saves to Gallery automatically.
  // This app targets iOS only. If Android support is needed, use expo-camera CameraView instead.
  const handlePickPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("需要相簿權限", "請在設定中允許相簿存取權限");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return;
      const sourceUri = result.assets[0].uri;
      await ensurePassportDir();
      const filename = `passport_${Date.now()}.jpg`;
      const destUri = `${PASSPORT_PHOTOS_DIR}${filename}`;
      await copyAsync({ from: sourceUri, to: destUri });
      if (photoUri) {
        await deletePassportPhoto(photoUri);
      }
      onPhotoChange(destUri);
    } catch (error) {
      console.error("選擇照片失敗", error);
      Alert.alert("錯誤", "選擇照片操作失敗,請稍後再試");
    }
  };

  const handleDeletePhoto = () => {
    if (!photoUri) return;
    Alert.alert("確認刪除", "確定要刪除護照照片嗎？", [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePassportPhoto(photoUri);
            onPhotoChange(null);
          } catch (error) {
            console.error("刪除照片失敗", error);
            Alert.alert("錯誤", "刪除照片失敗,請稍後再試");
          }
        },
      },
    ]);
  };

  const handleViewPhoto = async () => {
    if (!photoUri) return;
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "生物辨識保護",
          "您的裝置尚未設定Face ID/指紋,護照照片功能暫時無法使用生物辨識保護",
          [
            { text: "取消", style: "cancel" },
            {
              text: "仍然查看",
              onPress: () => setShowPhoto(true),
            },
          ],
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "驗證身分以查看護照照片",
        cancelLabel: "取消",
      });
      if (result.success) {
        setShowPhoto(true);
      }
    } catch (error) {
      console.error("查看照片失敗", error);
      Alert.alert("錯誤", "查看照片操作失敗,請稍後再試");
    }
  };

  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>護照照片</Text>
      <View style={styles.photoActions}>
        {photoUri ? (
          <>
            <Pressable style={styles.photoButton} onPress={handleViewPhoto}>
              <Ionicons name="eye-outline" size={16} color="#2563EB" />
              <Text style={styles.photoButtonText}>查看</Text>
            </Pressable>
            <Pressable style={styles.photoButton} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={16} color="#2563EB" />
              <Text style={styles.photoButtonText}>重拍</Text>
            </Pressable>
            <Pressable style={styles.photoButton} onPress={handlePickPhoto}>
              <Ionicons name="images-outline" size={16} color="#2563EB" />
              <Text style={styles.photoButtonText}>從相簿選</Text>
            </Pressable>
            <Pressable
              style={[styles.photoButton, styles.photoDeleteButton]}
              onPress={handleDeletePhoto}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={[styles.photoButtonText, { color: "#EF4444" }]}>
                刪除
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.photoButton} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={16} color="#2563EB" />
              <Text style={styles.photoButtonText}>拍照</Text>
            </Pressable>
            <Pressable style={styles.photoButton} onPress={handlePickPhoto}>
              <Ionicons name="images-outline" size={16} color="#2563EB" />
              <Text style={styles.photoButtonText}>從相簿選</Text>
            </Pressable>
          </>
        )}
      </View>

      <Modal
        visible={showPhoto}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPhoto(false)}
      >
        <View style={styles.photoOverlay}>
          <Pressable
            style={styles.photoCloseButton}
            onPress={() => setShowPhoto(false)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              style={styles.photoImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  formField: {
    gap: 4,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  photoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  photoDeleteButton: {
    backgroundColor: "#FEF2F2",
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  photoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  photoImage: {
    width: "90%",
    height: "80%",
  },
});
