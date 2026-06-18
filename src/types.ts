export interface UserProfile {
  name: "Rhon" | "Suz";
  age: number;
  currentWeight: number;
  goalWeight: number;
  goals: string[];
  glutenFree: boolean;
  lowSugar: boolean;
  recoveryNote: string;
  meds: string;
  supplements: string;
  allergies: string;
  foodRestrictions: string;
  preferences: string;
  streak: number;
  badges: string[];
  pin?: string | null;
}

export interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  notes?: string;
  user: "Rhon" | "Suz";
}

export interface WaterRecord {
  id: string;
  date: string;
  ounces: number;
  user: "Rhon" | "Suz";
}

export interface ExerciseRecord {
  id: string;
  date: string;
  minutes: number;
  activity: string;
  user: "Rhon" | "Suz";
}

export interface FoodRecord {
  id: string;
  date: string;
  foodName: string;
  calories: number;
  protein: number;
  user: "Rhon" | "Suz";
}

export interface PantryItem {
  id: string;
  name: string;
  qty: string;
  category: "Proteins" | "Produce" | "Dairy" | "Frozen Foods" | "Grains & Starches" | "Pantry Staples" | "Snacks";
  notes?: string;
  isGlutenFree?: boolean;
}

export interface WinRecord {
  id: string;
  user: "Rhon" | "Suz" | "Together";
  text: string;
  date: string;
}

export interface CheckInScale {
  id: string;
  date: string;
  user: "rhon" | "suz" | "shared";
  energy: number; // 1-10
  mood: number;   // 1-10
  stress: number; // 1-10
  cravings: number; // 1-10
  connectionToGod: number; // 1-10
  gratitudeNote: string;
  // Support morning vs night inventories
  inventoryType?: "morning" | "night";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bliss" | "system";
  text: string;
  timestamp: string;
  userContext: "rhon" | "suz" | "shared";
  isVoice?: boolean;
}

export interface PermanentMemory {
  id: string;
  category: "preference" | "restriction" | "pattern" | "milestone";
  content: string;
  dateAdded: string;
}
