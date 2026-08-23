import AsyncStorage from "@react-native-async-storage/async-storage";
import { documentDirectory } from "expo-file-system/legacy";
import {
  getInfoAsync,
  deleteAsync,
  makeDirectoryAsync,
} from "expo-file-system";
import type { TravelerProfile } from "@/data";

const STORAGE_KEY = "travelerProfiles";

export async function loadProfiles(): Promise<TravelerProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfiles();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultProfiles();
    return parsed as TravelerProfile[];
  } catch {
    return createDefaultProfiles();
  }
}

export async function saveProfiles(profiles: TravelerProfile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error("儲存旅伴資訊失敗", error);
  }
}

export function createDefaultProfiles(): TravelerProfile[] {
  return ["p1", "p2", "p3", "p4"].map((id, i) => ({
    id,
    displayName: `旅伴${i + 1}`,
    bloodType: "",
    allergies: "",
    medicalNotes: "",
    passportNumberLast4: "",
    passportPhotoUri: null,
    emergencyContactName: "",
    emergencyContactPhone: "",
  }));
}

export async function deletePassportPhoto(uri: string): Promise<void> {
  try {
    const info = await getInfoAsync(uri);
    if (info.exists) {
      await deleteAsync(uri);
    }
  } catch (error) {
    console.error("刪除護照照片失敗", error);
  }
}

export const PASSPORT_PHOTOS_DIR = `${documentDirectory}passportPhotos/`;

export async function ensurePassportDir(): Promise<void> {
  await makeDirectoryAsync(PASSPORT_PHOTOS_DIR, { intermediates: true });
}
