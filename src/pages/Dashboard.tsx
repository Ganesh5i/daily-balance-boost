import { useEffect, useState } from 'react';
import { Wallet, Drumstick, Droplets, Calendar } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getTodayExpenses,
  getTodayProteinEntries,
  getTodayWaterIntake,
  formatDate,
  resetTodayData,
} from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const PROTEIN_GOAL = 100; // grams
const WATER_GOAL = 4000; // ml (4 liters)

export default function Dashboard() {
  const { toast } = useToast();
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);

  const loadData = () => {
    const expenses = getTodayExpenses();
    setTotalExpense(expenses.reduce((sum, e) => sum + e.amount, 0));

    const proteinEntries = getTodayProteinEntries();
    setTotalProtein(proteinEntries.reduce((sum, e) => sum + e.protein, 0));

    setWaterIntake(getTodayWaterIntake());
  };

  useEffect(() => {
    loadData();
    // Listen for storage changes
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleReset = () => {
    resetTodayData();
    loadData();
    toast({
      title: "Data Reset",
      description: "Today's data has been cleared.",
    });
  };

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Dashboard</h1>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(today)}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset Today's Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Expense"
          value={`₹${totalExpense.toLocaleString()}`}
          subtitle="Today's spending"
          icon={<Wallet className="h-5 w-5" />}
          variant="expense"
        />
        <StatCard
          title="Protein Intake"
          value={`${totalProtein.toFixed(0)}g`}
          subtitle={`Goal: ${PROTEIN_GOAL}g`}
          icon={<Drumstick className="h-5 w-5" />}
          progress={(totalProtein / PROTEIN_GOAL) * 100}
          progressLabel="Daily progress"
          variant="protein"
        />
        <StatCard
          title="Water Intake"
          value={`${(waterIntake / 1000).toFixed(1)}L`}
          subtitle={`Goal: ${WATER_GOAL / 1000}L`}
          icon={<Droplets className="h-5 w-5" />}
          progress={(waterIntake / WATER_GOAL) * 100}
          progressLabel="Daily progress"
          variant="water"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              variant="softExpense"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <a href="/expenses">
                <Wallet className="h-6 w-6" />
                <span>Add Expense</span>
              </a>
            </Button>
            <Button
              variant="softProtein"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <a href="/protein">
                <Drumstick className="h-6 w-6" />
                <span>Log Protein</span>
              </a>
            </Button>
            <Button
              variant="softWater"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <a href="/water">
                <Droplets className="h-6 w-6" />
                <span>Log Water</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goal Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card variant={totalProtein >= PROTEIN_GOAL ? 'protein' : 'default'}>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                totalProtein >= PROTEIN_GOAL
                  ? 'gradient-protein text-protein-foreground'
                  : 'bg-muted'
              }`}
            >
              {totalProtein >= PROTEIN_GOAL ? '✓' : '💪'}
            </div>
            <div>
              <p className="font-semibold">
                {totalProtein >= PROTEIN_GOAL
                  ? 'Protein Goal Achieved! 🎉'
                  : `${(PROTEIN_GOAL - totalProtein).toFixed(0)}g more protein needed`}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalProtein >= PROTEIN_GOAL
                  ? 'Great job hitting your target!'
                  : 'Keep going, you got this!'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant={waterIntake >= WATER_GOAL ? 'water' : 'default'}>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                waterIntake >= WATER_GOAL
                  ? 'gradient-water text-water-foreground'
                  : 'bg-muted'
              }`}
            >
              {waterIntake >= WATER_GOAL ? '✓' : '💧'}
            </div>
            <div>
              <p className="font-semibold">
                {waterIntake >= WATER_GOAL
                  ? 'Water Goal Achieved! 🎉'
                  : `${((WATER_GOAL - waterIntake) / 1000).toFixed(1)}L more water needed`}
              </p>
              <p className="text-sm text-muted-foreground">
                {waterIntake >= WATER_GOAL
                  ? 'Stay hydrated champion!'
                  : 'Stay hydrated!'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
