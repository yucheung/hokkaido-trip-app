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

export const trips: Trip[] = rawData.trips;
export const spots: Spot[] = rawData.spots;
export const shoppingGuide: ShoppingGuideItem[] = rawData.shoppingGuide as ShoppingGuideItem[];
export const officialCoupons: OfficialCoupon[] = rawData.officialCoupons;
export const travelNotices: TravelNoticeItem[] = rawData.travelNotices as TravelNoticeItem[];
export const flights: FlightInfo[] = rawData.flights;
export const emergencyContacts: EmergencyContact[] = rawData.emergencyContacts;
export const weatherLocations: WeatherLocation[] = rawData.weatherLocations;
