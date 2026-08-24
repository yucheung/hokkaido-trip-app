import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { TravelerProfile } from "@/data";
import { loadProfiles, saveProfiles } from "@/lib/traveler-profile";
import PassportPhotoFeature from "./PassportPhotoFeature";

export function TravelerProfileSection() {
  const [profiles, setProfiles] = useState<TravelerProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<TravelerProfile | null>(
    null,
  );
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
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function EditForm({
  profile,
  onUpdate,
}: {
  profile: TravelerProfile;
  onUpdate: (p: TravelerProfile) => void;
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

      <PassportPhotoFeature
        photoUri={profile.passportPhotoUri}
        onPhotoChange={(uri) => onUpdate({ ...profile, passportPhotoUri: uri })}
      />
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
});
