// Storage utilities for localStorage persistence

export interface Expense {
  id: string;
  item: string;
  category: string;
  amount: number;
  date: string;
}

export interface ProteinEntry {
  id: string;
  foodId: string;
  quantity: number;
  protein: number;
  date: string;
}

export interface WaterEntry {
  id: string;
  amount: number;
  date: string;
  timestamp: number;
}

const EXPENSES_KEY = 'daily_expenses';
const PROTEIN_KEY = 'protein_entries';
const WATER_KEY = 'water_entries';

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Expenses
export const getExpenses = (): Expense[] => {
  const data = localStorage.getItem(EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getTodayExpenses = (): Expense[] => {
  const today = getTodayDate();
  return getExpenses().filter((e) => e.date === today);
};

export const addExpense = (expense: Omit<Expense, 'id'>): Expense => {
  const expenses = getExpenses();
  const newExpense = { ...expense, id: crypto.randomUUID() };
  expenses.push(newExpense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  return newExpense;
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses().filter((e) => e.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

// Protein entries
export const getProteinEntries = (): ProteinEntry[] => {
  const data = localStorage.getItem(PROTEIN_KEY);
  return data ? JSON.parse(data) : [];
};

export const getTodayProteinEntries = (): ProteinEntry[] => {
  const today = getTodayDate();
  return getProteinEntries().filter((e) => e.date === today);
};

export const addProteinEntry = (entry: Omit<ProteinEntry, 'id'>): ProteinEntry => {
  const entries = getProteinEntries();
  const newEntry = { ...entry, id: crypto.randomUUID() };
  entries.push(newEntry);
  localStorage.setItem(PROTEIN_KEY, JSON.stringify(entries));
  return newEntry;
};

export const deleteProteinEntry = (id: string): void => {
  const entries = getProteinEntries().filter((e) => e.id !== id);
  localStorage.setItem(PROTEIN_KEY, JSON.stringify(entries));
};

// Water entries
export const getWaterEntries = (): WaterEntry[] => {
  const data = localStorage.getItem(WATER_KEY);
  return data ? JSON.parse(data) : [];
};

export const getTodayWaterIntake = (): number => {
  const today = getTodayDate();
  const entries = getWaterEntries().filter((e) => e.date === today);
  return entries.reduce((sum, e) => sum + e.amount, 0);
};

export const addWaterEntry = (amount: number): WaterEntry => {
  const entries = getWaterEntries();
  const newEntry: WaterEntry = {
    id: crypto.randomUUID(),
    amount,
    date: getTodayDate(),
    timestamp: Date.now(),
  };
  entries.push(newEntry);
  localStorage.setItem(WATER_KEY, JSON.stringify(entries));
  return newEntry;
};

export const resetTodayData = (): void => {
  const today = getTodayDate();
  
  const expenses = getExpenses().filter((e) => e.date !== today);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  
  const protein = getProteinEntries().filter((e) => e.date !== today);
  localStorage.setItem(PROTEIN_KEY, JSON.stringify(protein));
  
  const water = getWaterEntries().filter((e) => e.date !== today);
  localStorage.setItem(WATER_KEY, JSON.stringify(water));
};

// Category icons mapping
export const categoryIcons: Record<string, string> = {
  // Food & Beverages
  milk: '🥛',
  tea: '🍵',
  coffee: '☕',
  breakfast: '🍳',
  lunch: '🍛',
  dinner: '🍽️',
  snacks: '🍿',
  street_food: '🌮',
  dosa_idli_parotta: '🫓',
  egg: '🥚',
  chicken_fish: '🍗',
  protein_foods: '💪',
  fruits: '🍎',
  vegetables: '🥕',
  sweets_desserts: '🍰',
  juice_soft_drinks: '🧃',
  // Household & Utilities
  grocery: '🛒',
  cooking_gas: '🔥',
  electricity_bill: '⚡',
  water_bill: '💧',
  house_rent: '🏠',
  maintenance: '🔧',
  cleaning_supplies: '🧹',
  // Travel & Transport
  bus_fare: '🚌',
  train_fare: '🚆',
  auto_taxi: '🛺',
  bike_fuel: '🏍️',
  car_fuel: '⛽',
  parking: '🅿️',
  toll: '🛣️',
  vehicle_service: '🔩',
  // Communication & Digital
  mobile_recharge: '📱',
  internet_wifi: '📶',
  ott_subscriptions: '📺',
  app_subscriptions: '📲',
  cloud_storage: '☁️',
  // Health & Fitness
  medicine: '💊',
  doctor_visit: '👨‍⚕️',
  health_checkup: '🩺',
  gym_fees: '🏋️',
  protein_supplements: '🥤',
  fitness_equipment: '🏃',
  sports_activity: '⚽',
  // Personal & Lifestyle
  clothing: '👕',
  footwear: '👟',
  haircut_salon: '💇',
  grooming_products: '🧴',
  cosmetics: '💄',
  accessories: '👜',
  // Entertainment & Social
  movies: '🎬',
  outing: '🎡',
  party: '🎉',
  events: '🎪',
  games: '🎮',
  streaming_rentals: '🎥',
  // Shopping & Online
  online_shopping: '🛍️',
  electronics: '📷',
  gadgets: '🔌',
  home_appliances: '🏠',
  stationery: '✏️',
  // Education & Learning
  course_fees: '🎓',
  online_courses: '💻',
  books: '📚',
  exam_fees: '📝',
  certifications: '📜',
  // Work & Business
  office_travel: '💼',
  work_tools: '🛠️',
  software: '💿',
  domain_hosting: '🌐',
  printing: '🖨️',
  // Financial
  emi: '💳',
  loan_repayment: '🏦',
  credit_card_payment: '💳',
  savings: '🐷',
  investment: '📈',
  // Miscellaneous
  gifts: '🎁',
  charity_donation: '❤️',
  emergency: '🚨',
  other: '📦',
};

export interface CategoryGroup {
  group: string;
  emoji: string;
  items: { value: string; label: string }[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    group: 'Food & Beverages',
    emoji: '🍽️',
    items: [
      { value: 'milk', label: 'Milk' },
      { value: 'tea', label: 'Tea' },
      { value: 'coffee', label: 'Coffee' },
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'snacks', label: 'Snacks' },
      { value: 'street_food', label: 'Street Food' },
      { value: 'dosa_idli_parotta', label: 'Dosa / Idli / Parotta' },
      { value: 'egg', label: 'Egg' },
      { value: 'chicken_fish', label: 'Chicken / Fish' },
      { value: 'protein_foods', label: 'Protein Foods' },
      { value: 'fruits', label: 'Fruits' },
      { value: 'vegetables', label: 'Vegetables' },
      { value: 'sweets_desserts', label: 'Sweets / Desserts' },
      { value: 'juice_soft_drinks', label: 'Juice / Soft Drinks' },
    ],
  },
  {
    group: 'Household & Utilities',
    emoji: '🏠',
    items: [
      { value: 'grocery', label: 'Grocery' },
      { value: 'cooking_gas', label: 'Cooking Gas' },
      { value: 'electricity_bill', label: 'Electricity Bill' },
      { value: 'water_bill', label: 'Water Bill' },
      { value: 'house_rent', label: 'House Rent' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'cleaning_supplies', label: 'Cleaning Supplies' },
    ],
  },
  {
    group: 'Travel & Transport',
    emoji: '🚍',
    items: [
      { value: 'bus_fare', label: 'Bus Fare' },
      { value: 'train_fare', label: 'Train Fare' },
      { value: 'auto_taxi', label: 'Auto / Taxi' },
      { value: 'bike_fuel', label: 'Bike Fuel' },
      { value: 'car_fuel', label: 'Car Fuel' },
      { value: 'parking', label: 'Parking' },
      { value: 'toll', label: 'Toll' },
      { value: 'vehicle_service', label: 'Vehicle Service' },
    ],
  },
  {
    group: 'Communication & Digital',
    emoji: '📱',
    items: [
      { value: 'mobile_recharge', label: 'Mobile Recharge' },
      { value: 'internet_wifi', label: 'Internet / WiFi' },
      { value: 'ott_subscriptions', label: 'OTT Subscriptions' },
      { value: 'app_subscriptions', label: 'App Subscriptions' },
      { value: 'cloud_storage', label: 'Cloud Storage' },
    ],
  },
  {
    group: 'Health & Fitness',
    emoji: '🏥',
    items: [
      { value: 'medicine', label: 'Medicine' },
      { value: 'doctor_visit', label: 'Doctor Visit' },
      { value: 'health_checkup', label: 'Health Checkup' },
      { value: 'gym_fees', label: 'Gym Fees' },
      { value: 'protein_supplements', label: 'Protein Supplements' },
      { value: 'fitness_equipment', label: 'Fitness Equipment' },
      { value: 'sports_activity', label: 'Sports Activity' },
    ],
  },
  {
    group: 'Personal & Lifestyle',
    emoji: '👕',
    items: [
      { value: 'clothing', label: 'Clothing' },
      { value: 'footwear', label: 'Footwear' },
      { value: 'haircut_salon', label: 'Haircut / Salon' },
      { value: 'grooming_products', label: 'Grooming Products' },
      { value: 'cosmetics', label: 'Cosmetics' },
      { value: 'accessories', label: 'Accessories' },
    ],
  },
  {
    group: 'Entertainment & Social',
    emoji: '🎉',
    items: [
      { value: 'movies', label: 'Movies' },
      { value: 'outing', label: 'Outing' },
      { value: 'party', label: 'Party' },
      { value: 'events', label: 'Events' },
      { value: 'games', label: 'Games' },
      { value: 'streaming_rentals', label: 'Streaming Rentals' },
    ],
  },
  {
    group: 'Shopping & Online',
    emoji: '🛍️',
    items: [
      { value: 'online_shopping', label: 'Online Shopping' },
      { value: 'electronics', label: 'Electronics' },
      { value: 'gadgets', label: 'Gadgets' },
      { value: 'home_appliances', label: 'Home Appliances' },
      { value: 'stationery', label: 'Stationery' },
    ],
  },
  {
    group: 'Education & Learning',
    emoji: '🎓',
    items: [
      { value: 'course_fees', label: 'Course Fees' },
      { value: 'online_courses', label: 'Online Courses' },
      { value: 'books', label: 'Books' },
      { value: 'exam_fees', label: 'Exam Fees' },
      { value: 'certifications', label: 'Certifications' },
    ],
  },
  {
    group: 'Work & Business',
    emoji: '💼',
    items: [
      { value: 'office_travel', label: 'Office Travel' },
      { value: 'work_tools', label: 'Work Tools' },
      { value: 'software', label: 'Software' },
      { value: 'domain_hosting', label: 'Domain / Hosting' },
      { value: 'printing', label: 'Printing' },
    ],
  },
  {
    group: 'Financial',
    emoji: '💸',
    items: [
      { value: 'emi', label: 'EMI' },
      { value: 'loan_repayment', label: 'Loan Repayment' },
      { value: 'credit_card_payment', label: 'Credit Card Payment' },
      { value: 'savings', label: 'Savings' },
      { value: 'investment', label: 'Investment' },
    ],
  },
  {
    group: 'Miscellaneous',
    emoji: '🎁',
    items: [
      { value: 'gifts', label: 'Gifts' },
      { value: 'charity_donation', label: 'Charity / Donation' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'other', label: 'Other' },
    ],
  },
];

// Flattened categories for backward compatibility
export const categories = categoryGroups.flatMap((group) => group.items);

// Protein foods data
export interface ProteinFood {
  id: string;
  name: string;
  proteinPer100g: number;
  unit: string;
  defaultQuantity: number;
  emoji: string;
}

export const proteinFoods: ProteinFood[] = [
  { id: 'soy_chunks', name: 'Soy Chunks', proteinPer100g: 52, unit: 'g', defaultQuantity: 50, emoji: '🫘' },
  { id: 'chicken_breast', name: 'Chicken Breast', proteinPer100g: 31, unit: 'g', defaultQuantity: 100, emoji: '🍗' },
  { id: 'whey_protein', name: 'Whey Protein', proteinPer100g: 25, unit: 'scoop', defaultQuantity: 1, emoji: '💪' },
  { id: 'peanuts', name: 'Peanuts', proteinPer100g: 26, unit: 'g', defaultQuantity: 50, emoji: '🥜' },
  { id: 'peanut_butter', name: 'Peanut Butter', proteinPer100g: 25, unit: 'g', defaultQuantity: 30, emoji: '🥜' },
  { id: 'cheese', name: 'Cheese', proteinPer100g: 22, unit: 'g', defaultQuantity: 50, emoji: '🧀' },
  { id: 'fish', name: 'Fish (Tuna/Salmon)', proteinPer100g: 22, unit: 'g', defaultQuantity: 100, emoji: '🐟' },
  { id: 'almonds', name: 'Almonds', proteinPer100g: 21, unit: 'g', defaultQuantity: 30, emoji: '🌰' },
  { id: 'pumpkin_seeds', name: 'Pumpkin Seeds', proteinPer100g: 19, unit: 'g', defaultQuantity: 30, emoji: '🎃' },
  { id: 'chickpeas', name: 'Chickpeas (Chana)', proteinPer100g: 19, unit: 'g', defaultQuantity: 100, emoji: '🫘' },
  { id: 'paneer', name: 'Paneer', proteinPer100g: 18, unit: 'g', defaultQuantity: 100, emoji: '🧈' },
  { id: 'flax_seeds', name: 'Flax Seeds', proteinPer100g: 18, unit: 'g', defaultQuantity: 20, emoji: '🌱' },
  { id: 'chia_seeds', name: 'Chia Seeds', proteinPer100g: 17, unit: 'g', defaultQuantity: 20, emoji: '🌱' },
  { id: 'egg_whites', name: 'Egg Whites', proteinPer100g: 11, unit: 'g', defaultQuantity: 100, emoji: '🥚' },
  { id: 'greek_yogurt', name: 'Greek Yogurt', proteinPer100g: 10, unit: 'g', defaultQuantity: 150, emoji: '🥣' },
  { id: 'tofu', name: 'Tofu', proteinPer100g: 9, unit: 'g', defaultQuantity: 100, emoji: '🧊' },
  { id: 'lentils', name: 'Lentils (Dal)', proteinPer100g: 9, unit: 'g', defaultQuantity: 100, emoji: '🍲' },
  { id: 'rajma', name: 'Rajma (Kidney Beans)', proteinPer100g: 8, unit: 'g', defaultQuantity: 100, emoji: '🫘' },
  { id: 'eggs', name: 'Eggs (Whole)', proteinPer100g: 6, unit: 'piece', defaultQuantity: 1, emoji: '🥚' },
  { id: 'curd', name: 'Curd (Yogurt)', proteinPer100g: 3.5, unit: 'g', defaultQuantity: 150, emoji: '🥣' },
  { id: 'milk', name: 'Milk', proteinPer100g: 3.4, unit: 'ml', defaultQuantity: 250, emoji: '🥛' },
];