import { useEffect, useRef, useState } from 'react';
import { Download, Upload, Save, RotateCcw, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  exportAllData,
  downloadBackup,
  saveBackupToLocal,
  loadBackupFromLocal,
  getLocalBackupTimestamp,
  restoreAllData,
  parseBackupFile,
  type BackupData,
} from '@/lib/backup';
import { format } from 'date-fns';

export default function Backup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localAt, setLocalAt] = useState<string | null>(null);

  useEffect(() => {
    setLocalAt(getLocalBackupTimestamp());
  }, []);

  const totals = (data: BackupData) =>
    `${data.expenses.length} expenses, ${data.protein_entries.length} protein, ${data.water_entries.length} water, ${data.notes.length} notes`;

  const handleSaveLocal = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const data = await exportAllData(user.id);
      saveBackupToLocal(data);
      setLocalAt(data.exportedAt);
      toast({ title: 'Saved to this device', description: totals(data) });
    } catch (e: any) {
      toast({ title: 'Backup failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const data = await exportAllData(user.id);
      downloadBackup(data);
      saveBackupToLocal(data);
      setLocalAt(data.exportedAt);
      toast({ title: 'Backup downloaded', description: totals(data) });
    } catch (e: any) {
      toast({ title: 'Export failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const runRestore = async (data: BackupData, mode: 'merge' | 'replace') => {
    if (!user) return;
    setBusy(true);
    try {
      const res = await restoreAllData(data, user.id, mode);
      toast({
        title: 'Data restored',
        description: `${res.expenses} expenses, ${res.protein_entries} protein, ${res.water_entries} water, ${res.notes} notes.`,
      });
    } catch (e: any) {
      toast({ title: 'Restore failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreLocal = async (mode: 'merge' | 'replace') => {
    const data = loadBackupFromLocal();
    if (!data) {
      toast({ title: 'No local backup found', variant: 'destructive' });
      return;
    }
    if (mode === 'replace' && !confirm('Replace mode will DELETE your current cloud data and restore from backup. Continue?')) return;
    runRestore(data, mode);
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await parseBackupFile(file);
      if (mode === 'replace' && !confirm('Replace mode will DELETE your current cloud data and restore from this file. Continue?')) return;
      runRestore(data, mode);
    } catch (err: any) {
      toast({ title: 'Invalid file', description: err.message, variant: 'destructive' });
    }
  };

  const [pendingMode, setPendingMode] = useState<'merge' | 'replace'>('merge');
  const pickFile = (mode: 'merge' | 'replace') => {
    setPendingMode(mode);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Backup & Restore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save a copy of all your records to this device or to a file, and restore any time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Save className="h-5 w-5" /> Backup
            </CardTitle>
            <CardDescription>
              Snapshot your expenses, protein, water, and notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={handleSaveLocal} disabled={busy}>
              <Save className="mr-2 h-4 w-4" /> Save to this device
            </Button>
            <Button className="w-full" variant="outline" onClick={handleDownload} disabled={busy}>
              <Download className="mr-2 h-4 w-4" /> Download backup file
            </Button>
            {localAt && (
              <p className="text-xs text-muted-foreground">
                Last local backup: {format(new Date(localAt), 'PPpp')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RotateCcw className="h-5 w-5" /> Restore
            </CardTitle>
            <CardDescription>
              Merge adds missing records. Replace wipes current data first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => handleRestoreLocal('merge')} disabled={busy || !localAt}>
                Merge from device
              </Button>
              <Button variant="outline" onClick={() => handleRestoreLocal('replace')} disabled={busy || !localAt}>
                Replace from device
              </Button>
              <Button variant="outline" onClick={() => pickFile('merge')} disabled={busy}>
                <Upload className="mr-2 h-4 w-4" /> Merge from file
              </Button>
              <Button variant="outline" onClick={() => pickFile('replace')} disabled={busy}>
                <Upload className="mr-2 h-4 w-4" /> Replace from file
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => handleFilePick(e, pendingMode)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            Your data is already saved to your account in the cloud and available on any device
            after sign-in. Use this page to keep an extra offline copy in case you ever want to roll back.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
