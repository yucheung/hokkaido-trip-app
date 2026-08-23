import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  copyAsync,
} from "expo-file-system";
import * as LocalAuthentication from "expo-local-authentication";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { TravelerProfile } from "@/data";
import {
  loadProfiles,
  saveProfiles,
  deletePassportPhoto,
  PASSPORT_PHOTOS_DIR,
  ensurePassportDir,
} from "@/lib/traveler-profile";

export function TravelerProfileSection() {
  const [profiles, setProfiles] = useState<TravelerProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<TravelerProfile | null>(
    null,
  );
  const [showPhoto, setShowPhoto] = useState<TravelerProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadProfiles().then((p) => {
      setProfiles(p);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      saveProfiles(profiles);
    }
  }, [profiles, loaded]);

  const updateProfile = (updated: TravelerProfile) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
  };

  // Note: On iOS, UIImagePickerController does NOT auto-save to Camera Roll.
  // On Android, launchCameraAsync saves to Gallery automatically.
  // This app targets iOS only. If Android support is needed, use expo-camera CameraView instead.
  const handleTakePhoto = async (profile: TravelerProfile) => {
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
    const filename = `passport_${profile.id}_${Date.now()}.jpg`;
    const destUri = `${PASSPORT_PHOTOS_DIR}${filename}`;
    await copyAsync({ from: sourceUri, to: destUri });
    if (profile.passportPhotoUri) {
      await deletePassportPhoto(profile.passportPhotoUri);
    }
    updateProfile({ ...profile, passportPhotoUri: destUri });
  } catch (error) {
    console.error("拍照失敗", error);
    Alert.alert("錯誤", "拍照操作失敗,請稍後再試");
  }
  };

  // Note: On iOS, UIImagePickerController does NOT auto-save to Camera Roll.
  // On Android, launchCameraAsync saves to Gallery automatically.
  // This app targets iOS only. If Android support is needed, use expo-camera CameraView instead.
  const handlePickPhoto = async (profile: TravelerProfile) => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
    const filename = `passport_${profile.id}_${Date.now()}.jpg`;
    const destUri = `${PASSPORT_PHOTOS_DIR}${filename}`;
    await copyAsync({ from: sourceUri, to: destUri });
    if (profile.passportPhotoUri) {
      await deletePassportPhoto(profile.passportPhotoUri);
    }
    updateProfile({ ...profile, passportPhotoUri: destUri });
  } catch (error) {
    console.error("選擇照片失敗", error);
    Alert.alert("錯誤", "選擇照片操作失敗,請稍後再試");
  }
  };

  const handleDeletePhoto = async (profile: TravelerProfile) => {
    if (!profile.passportPhotoUri) return;
    Alert.alert("確認刪除", "確定要刪除護照照片嗎？", [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePassportPhoto(profile.passportPhotoUri!);
            updateProfile({ ...profile, passportPhotoUri: null });
          } catch (error) {
            console.error("刪除照片失敗", error);
            Alert.alert("錯誤", "刪除照片失敗,請稍後再試");
          }
        },
      },
    ]);
  };

  const handleViewPhoto = async (profile: TravelerProfile) => {
    if (!profile.passportPhotoUri) return;
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
              onPress: () => setShowPhoto(profile),
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
        setShowPhoto(profile);
      }
    } catch (error) {
      console.error("查看照片失敗", error);
      Alert.alert("錯誤", "查看照片操作失敗,請稍後再試");
    }
  };

  const hasAnyInfo = (p: TravelerProfile) =>
    p.bloodType ||
    p.allergies ||
    p.medicalNotes ||
    p.passportNumberLast4 ||
    p.passportPhotoUri ||
    p.emergencyContactName ||
    p.emergencyContactPhone;

  if (!loaded) return null;

  return (
    <>
      {profiles.map((profile) => (
        <View key={profile.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{profile.displayName}</Text>
            <Pressable
              style={styles.editButton}
              onPress={() => setEditingProfile(profile)}
            >
              <Text style={styles.editButtonText}>編輯</Text>
            </Pressable>
          </View>
          {hasAnyInfo(profile) ? (
            <View style={styles.cardInfo}>
              {profile.bloodType ? (
                <Text style={styles.cardDetail}>血型: {profile.bloodType}</Text>
              ) : null}
              {profile.emergencyContactName ? (
                <Text style={styles.cardDetail}>
                  緊急聯絡人: {profile.emergencyContactName}
                  {profile.emergencyContactPhone
                    ? ` ${profile.emergencyContactPhone}`
                    : ""}
                </Text>
              ) : null}
              {profile.allergies ? (
                <Text style={styles.cardDetail}>過敏: {profile.allergies}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.cardEmpty}>尚未填寫</Text>
          )}
        </View>
      ))}

      <Text style={styles.privacyNotice}>
        這些資訊僅儲存在您的手機裡,不會上傳到任何伺服器
      </Text>

      {/* Edit Modal */}
      <Modal
        visible={editingProfile !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditingProfile(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                編輯{editingProfile?.displayName}
              </Text>
              <Pressable onPress={() => setEditingProfile(null)} hitSlop={8}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {editingProfile && (
                <EditForm
                  profile={editingProfile}
                  onUpdate={(updated) => {
                    updateProfile(updated);
                    setEditingProfile(updated);
                  }}
                  onTakePhoto={() => handleTakePhoto(editingProfile)}
                  onPickPhoto={() => handlePickPhoto(editingProfile)}
                  onDeletePhoto={() => handleDeletePhoto(editingProfile)}
                  onViewPhoto={() => handleViewPhoto(editingProfile)}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Photo Viewer Modal */}
      <Modal
        visible={showPhoto !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPhoto(null)}
      >
        <View style={styles.photoOverlay}>
          <Pressable
            style={styles.photoCloseButton}
            onPress={() => setShowPhoto(null)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          {showPhoto?.passportPhotoUri && (
            <Image
              source={{ uri: showPhoto.passportPhotoUri }}
              style={styles.photoImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
}

function EditForm({
  profile,
  onUpdate,
  onTakePhoto,
  onPickPhoto,
  onDeletePhoto,
  onViewPhoto,
}: {
  profile: TravelerProfile;
  onUpdate: (p: TravelerProfile) => void;
  onTakePhoto: () => void;
  onPickPhoto: () => void;
  onDeletePhoto: () => void;
  onViewPhoto: () => void;
}) {
  return (
    <View style={styles.form}>
      <FormField label="血型">
        <TextInput
          style={styles.input}
          value={profile.bloodType ?? ""}
          onChangeText={(t) => onUpdate({ ...profile, bloodType: t })}
          placeholder="例: O"
        />
      </FormField>

      <FormField label="過敏">
        <TextInput
          style={styles.input}
          value={profile.allergies ?? ""}
          onChangeText={(t) => onUpdate({ ...profile, allergies: t })}
          placeholder="例: 花生、海鮮"
        />
      </FormField>

      <FormField label="醫療備註">
        <TextInput
          style={styles.input}
          value={profile.medicalNotes ?? ""}
          onChangeText={(t) => onUpdate({ ...profile, medicalNotes: t })}
          placeholder="例: 糖尿病用藥"
        />
      </FormField>

      <FormField label="護照號碼(末4碼)">
        <TextInput
          style={styles.input}
          value={profile.passportNumberLast4 ?? ""}
          onChangeText={(t) => {
            const clean = t.replace(/[^0-9]/g, "").slice(0, 4);
            onUpdate({ ...profile, passportNumberLast4: clean });
          }}
          placeholder="建議僅填末4碼"
          maxLength={4}
          keyboardType="number-pad"
        />
      </FormField>

      <FormField label="緊急聯絡人">
        <TextInput
          style={styles.input}
          value={profile.emergencyContactName ?? ""}
          onChangeText={(t) =>
            onUpdate({ ...profile, emergencyContactName: t })
          }
          placeholder="聯絡人姓名"
        />
      </FormField>

      <FormField label="緊急聯絡電話">
        <TextInput
          style={styles.input}
          value={profile.emergencyContactPhone ?? ""}
          onChangeText={(t) =>
            onUpdate({ ...profile, emergencyContactPhone: t })
          }
          placeholder="電話號碼"
          keyboardType="phone-pad"
        />
      </FormField>

      <FormField label="護照照片">
        <View style={styles.photoActions}>
          {profile.passportPhotoUri ? (
            <>
              <Pressable style={styles.photoButton} onPress={onViewPhoto}>
                <Ionicons name="eye-outline" size={16} color="#2563EB" />
                <Text style={styles.photoButtonText}>查看</Text>
              </Pressable>
              <Pressable style={styles.photoButton} onPress={onTakePhoto}>
                <Ionicons name="camera-outline" size={16} color="#2563EB" />
                <Text style={styles.photoButtonText}>重拍</Text>
              </Pressable>
              <Pressable style={styles.photoButton} onPress={onPickPhoto}>
                <Ionicons name="images-outline" size={16} color="#2563EB" />
                <Text style={styles.photoButtonText}>從相簿選</Text>
              </Pressable>
              <Pressable
                style={[styles.photoButton, styles.photoDeleteButton]}
                onPress={onDeletePhoto}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={[styles.photoButtonText, { color: "#EF4444" }]}>
                  刪除
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.photoButton} onPress={onTakePhoto}>
                <Ionicons name="camera-outline" size={16} color="#2563EB" />
                <Text style={styles.photoButtonText}>拍照</Text>
              </Pressable>
              <Pressable style={styles.photoButton} onPress={onPickPhoto}>
                <Ionicons name="images-outline" size={16} color="#2563EB" />
                <Text style={styles.photoButtonText}>從相簿選</Text>
              </Pressable>
            </>
          )}
        </View>
      </FormField>
    </View>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  editButton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  cardInfo: {
    gap: 2,
  },
  cardDetail: {
    fontSize: 12,
    color: "#64748B",
  },
  cardEmpty: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  privacyNotice: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F1F5F9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalScrollContent: {
    padding: 16,
  },
  form: {
    gap: 14,
  },
  formField: {
    gap: 4,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
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
