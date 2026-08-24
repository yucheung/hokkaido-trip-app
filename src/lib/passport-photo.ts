import {
  documentDirectory,
  makeDirectoryAsync,
  deleteAsync,
  getInfoAsync,
} from "expo-file-system/legacy";

export const PASSPORT_PHOTOS_DIR = `${documentDirectory}passportPhotos/`;

export async function ensurePassportDir(): Promise<void> {
  await makeDirectoryAsync(PASSPORT_PHOTOS_DIR, { intermediates: true });
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
