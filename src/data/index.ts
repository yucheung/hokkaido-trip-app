import rawData from "./trip-data.json";

export interface Trip {
  day: number;
  date: string;
  weekday: string;
  title: string;
  fullItinerary: string;
  meals: {
    breakfast: { label: string; included: boolean };
    lunch: { label: string; included: boolean };
    dinner: { label: string; included: boolean };
  };
  hotelOptions: string[];
  hotelPhone: string;
  relatedSpotIds: string[];
}

export interface Spot {
  id: string;
  name: string;
  day: number[];
  tagline: string;
  mustEat: string[];
  mustSee: string[];
  tips: string[];
}

export interface ShoppingGuideItem {
  location: string;
  category: "藥妝" | "3C" | "伴手禮";
  storeName: string;
  items: string[];
  note: string;
}

export interface OfficialCoupon {
  storeName: string;
  discount: string;
  applicableLocations: string[];
  sourceNote: string;
}

export interface TravelNoticeItem {
  category: "行李規定" | "海關規定" | "退稅流程" | "登機須知" | "打包眉角";
  title: string;
  detail: string[];
  severity: "info" | "warning";
}

export interface FlightInfo {
  date: string;
  weekday: string;
  flightNo: string;
  airline: string;
  route: string;
  departTime: string;
  arriveTime: string;
  gateInfo: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  note?: string;
}

export interface WeatherLocation {
  day: number;
  location: string;
  latitude: number;
  longitude: number;
}

export interface TravelerProfile {
  id: string;
  displayName: string;
  bloodType: string;
  allergies: string;
  medicalNotes: string;
  passportNumberLast4: string;
  passportPhotoUri: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface DepartureChecklistItem {
  item: string;
}

export type ChecklistState = Record<number, boolean>;

export interface JapanesePhrase {
  category: string;
  japanese: string;
  romaji: string;
  chinese: string;
}

export interface EnglishPhrase {
  category: string;
  english: string;
  chinese: string;
}

export interface ImportantAddress {
  name: string;
  japaneseAddress: string;
  phone: string;
  note?: string;
}

// 景點封面圖（靜態 require，檔名對應 Spot.id）
export const spotImages: Record<string, any> = {
  "hakodateyama": require("@/assets/images/hakodateyama.jpg"),
  "goryokaku": require("@/assets/images/goryokaku.jpg"),
  "hakodate-asaichi": require("@/assets/images/hakodate-asaichi.jpg"),
  "nixe-park": require("@/assets/images/nixe-park.jpg"),
  "jigokudani": require("@/assets/images/jigokudani.jpg"),
  "farm-tomita": require("@/assets/images/farm-tomita.jpg"),
  "shikisai-no-oka": require("@/assets/images/shikisai-no-oka.jpg"),
  "tanukikoji": require("@/assets/images/tanukikoji.jpg"),
  "otaru-canal": require("@/assets/images/otaru-canal.jpg"),
  "showa-shinzan": require("@/assets/images/showa-shinzan.jpg"),
  "toyako-fireworks": require("@/assets/images/toyako-fireworks.jpg"),
  "onuma-park": require("@/assets/images/onuma-park.jpg"),
  "kanemori": require("@/assets/images/kanemori.jpg"),
  "trappistine-convent": require("@/assets/images/trappistine-convent.jpg"),
};

export const trips: Trip[] = rawData.trips;
export const spots: Spot[] = rawData.spots;
export const shoppingGuide: ShoppingGuideItem[] = rawData.shoppingGuide as ShoppingGuideItem[];
export const officialCoupons: OfficialCoupon[] = rawData.officialCoupons;
export const travelNotices: TravelNoticeItem[] = rawData.travelNotices as TravelNoticeItem[];
export const flights: FlightInfo[] = rawData.flights;
export const emergencyContacts: EmergencyContact[] = rawData.emergencyContacts;
export const weatherLocations: WeatherLocation[] = rawData.weatherLocations;
export const japanesePhrases: JapanesePhrase[] = rawData.japanesePhrases;
export const englishPhrases: EnglishPhrase[] = rawData.englishPhrases;
export const importantAddresses: ImportantAddress[] = rawData.importantAddresses;
export const departureChecklist: DepartureChecklistItem[] = rawData.departureChecklist;
export const hotelAddressNote: string = (rawData as any).hotelAddressNote ?? "";
