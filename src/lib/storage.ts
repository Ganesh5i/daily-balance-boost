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
  milk: '🥛',
  tea: '🍵',
  coffee: '☕',
  dosa: '🫓',
  egg: '🥚',
  protein_foods: '🍗',
  other: '📦',
};

export const categories = [
  { value: 'milk', label: 'Milk' },
  { value: 'tea', label: 'Tea' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'dosa', label: 'Dosa' },
  { value: 'egg', label: 'Egg' },
  { value: 'protein_foods', label: 'Protein Foods' },
  { value: 'other', label: 'Other' },
];

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
  { id: 'chicken', name: 'Chicken Breast', proteinPer100g: 31, unit: 'g', defaultQuantity: 100, emoji: '🍗' },
  { id: 'eggs', name: 'Eggs', proteinPer100g: 6, unit: 'piece', defaultQuantity: 1, emoji: '🥚' },
  { id: 'paneer', name: 'Paneer', proteinPer100g: 18, unit: 'g', defaultQuantity: 100, emoji: '🧀' },
  { id: 'milk', name: 'Milk', proteinPer100g: 3.4, unit: 'ml', defaultQuantity: 100, emoji: '🥛' },
  { id: 'curd', name: 'Curd / Yogurt', proteinPer100g: 11, unit: 'g', defaultQuantity: 100, emoji: '🥣' },
  { id: 'peanut_butter', name: 'Peanut Butter', proteinPer100g: 25, unit: 'g', defaultQuantity: 30, emoji: '🥜' },
  { id: 'whey', name: 'Whey Protein', proteinPer100g: 80, unit: 'g', defaultQuantity: 30, emoji: '💪' },
  { id: 'dal', name: 'Dal / Lentils', proteinPer100g: 9, unit: 'g', defaultQuantity: 100, emoji: '🍲' },
  { id: 'soya_chunks', name: 'Soya Chunks', proteinPer100g: 52, unit: 'g', defaultQuantity: 50, emoji: '🫘' },
  { id: 'fish', name: 'Fish', proteinPer100g: 22, unit: 'g', defaultQuantity: 100, emoji: '🐟' },
];
