import { supabase } from '@/integrations/supabase/client';

export type BackupData = {
  version: 1;
  exportedAt: string;
  userId: string;
  expenses: any[];
  protein_entries: any[];
  water_entries: any[];
  notes: any[];
};

export async function exportAllData(userId: string): Promise<BackupData> {
  const [expenses, protein, water, notes] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', userId),
    supabase.from('protein_entries').select('*').eq('user_id', userId),
    supabase.from('water_entries').select('*').eq('user_id', userId),
    supabase.from('notes').select('*').eq('user_id', userId),
  ]);

  if (expenses.error) throw expenses.error;
  if (protein.error) throw protein.error;
  if (water.error) throw water.error;
  if (notes.error) throw notes.error;

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId,
    expenses: expenses.data ?? [],
    protein_entries: protein.data ?? [],
    water_entries: water.data ?? [],
    notes: notes.data ?? [],
  };
}

export function downloadBackup(data: BackupData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `daily-tracker-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function saveBackupToLocal(data: BackupData) {
  localStorage.setItem('daily-tracker-backup', JSON.stringify(data));
  localStorage.setItem('daily-tracker-backup-at', data.exportedAt);
}

export function loadBackupFromLocal(): BackupData | null {
  const raw = localStorage.getItem('daily-tracker-backup');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BackupData;
  } catch {
    return null;
  }
}

export function getLocalBackupTimestamp(): string | null {
  return localStorage.getItem('daily-tracker-backup-at');
}

type RestoreResult = {
  expenses: number;
  protein_entries: number;
  water_entries: number;
  notes: number;
};

// Strip fields we shouldn't re-insert and remap user_id to the current user.
function normalizeRows(rows: any[], userId: string) {
  return rows.map((row) => {
    const { id, created_at, updated_at, ...rest } = row;
    return { ...rest, user_id: userId };
  });
}

export async function restoreAllData(
  data: BackupData,
  userId: string,
  mode: 'merge' | 'replace' = 'merge'
): Promise<RestoreResult> {
  if (mode === 'replace') {
    await Promise.all([
      supabase.from('expenses').delete().eq('user_id', userId),
      supabase.from('protein_entries').delete().eq('user_id', userId),
      supabase.from('water_entries').delete().eq('user_id', userId),
      supabase.from('notes').delete().eq('user_id', userId),
    ]);
  }

  const expenses = normalizeRows(data.expenses ?? [], userId);
  const protein = normalizeRows(data.protein_entries ?? [], userId);
  const water = normalizeRows(data.water_entries ?? [], userId);
  const notes = normalizeRows(data.notes ?? [], userId);

  const results = await Promise.all([
    expenses.length ? supabase.from('expenses').insert(expenses) : null,
    protein.length ? supabase.from('protein_entries').insert(protein) : null,
    water.length ? supabase.from('water_entries').insert(water) : null,
    notes.length ? supabase.from('notes').insert(notes) : null,
  ]);

  for (const r of results) {
    if (r && r.error) throw r.error;
  }

  return {
    expenses: expenses.length,
    protein_entries: protein.length,
    water_entries: water.length,
    notes: notes.length,
  };
}

export function parseBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.expenses)) {
          throw new Error('Invalid backup file');
        }
        resolve(parsed as BackupData);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
