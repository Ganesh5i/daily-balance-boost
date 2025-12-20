import { useState, useEffect } from 'react';
import { Droplets, Check, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getTodayWaterIntake, addWaterEntry, getWaterEntries, getTodayDate } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const WATER_GOAL = 4000; // ml (4 liters)

const waterButtons = [
  { amount: 250, label: '+250ml', icon: '🥤' },
  { amount: 500, label: '+500ml', icon: '🍶' },
  { amount: 1000, label: '+1L', icon: '🫗' },
];

export default function Water() {
  const { toast } = useToast();
  const [waterIntake, setWaterIntake] = useState(0);
  const [recentEntries, setRecentEntries] = useState<{ amount: number; timestamp: number }[]>([]);

  const loadData = () => {
    setWaterIntake(getTodayWaterIntake());
    const today = getTodayDate();
    const entries = getWaterEntries()
      .filter((e) => e.date === today)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
    setRecentEntries(entries);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWater = (amount: number) => {
    addWaterEntry(amount);
    loadData();
    
    const newTotal = waterIntake + amount;
    const isGoalNowMet = newTotal >= WATER_GOAL && waterIntake < WATER_GOAL;
    
    toast({
      title: isGoalNowMet ? "🎉 Goal Achieved!" : "Water logged",
      description: isGoalNowMet
        ? "You've hit your daily water goal!"
        : `+${amount}ml added (Total: ${(newTotal / 1000).toFixed(1)}L)`,
    });
  };

  const progress = (waterIntake / WATER_GOAL) * 100;
  const isGoalMet = waterIntake >= WATER_GOAL;
  const glassesCount = Math.floor(waterIntake / 250);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Water Tracker</h1>
        <p className="mt-1 text-muted-foreground">Goal: {WATER_GOAL / 1000}L per day</p>
      </div>

      {/* Main Progress Card */}
      <Card variant={isGoalMet ? 'water' : 'default'} className="animate-slide-up overflow-hidden">
        <CardContent className="relative p-6">
          {/* Background Wave Animation */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out gradient-water opacity-20"
            style={{
              height: `${Math.min(progress, 100)}%`,
              transform: 'translateY(0)',
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Intake</p>
                <p className="text-5xl font-bold text-water">
                  {(waterIntake / 1000).toFixed(1)}L
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isGoalMet
                    ? `Exceeded by ${((waterIntake - WATER_GOAL) / 1000).toFixed(1)}L! 💧`
                    : `${((WATER_GOAL - waterIntake) / 1000).toFixed(1)}L remaining`}
                </p>
              </div>
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-3xl ${
                  isGoalMet ? 'gradient-water animate-pulse-soft' : 'bg-water/10'
                }`}
              >
                {isGoalMet ? (
                  <Check className="h-10 w-10 text-water-foreground" />
                ) : (
                  <Droplets className="h-10 w-10 text-water" />
                )}
              </div>
            </div>

            <div className="mt-6">
              <Progress value={Math.min(progress, 100)} variant="water" className="h-5" />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">≈ {glassesCount} glasses (250ml)</span>
                <span className="font-semibold">{Math.min(progress, 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Buttons */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-water" />
            Log Water
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {waterButtons.map((btn, index) => (
              <Button
                key={btn.amount}
                variant="water"
                size="xl"
                onClick={() => handleAddWater(btn.amount)}
                className="flex-col gap-2 py-6 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-3xl">{btn.icon}</span>
                <span className="text-lg font-bold">{btn.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Glasses */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <CardHeader>
          <CardTitle className="text-base">Glasses Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                  i < glassesCount
                    ? 'border-water bg-water/20 text-water'
                    : 'border-border bg-muted/30 text-muted-foreground/30'
                }`}
                style={{
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <span className="text-xl">{i < glassesCount ? '💧' : '○'}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Each glass = 250ml • {16 - glassesCount} glasses to reach goal
          </p>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-base">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEntries.map((entry, index) => (
                <div
                  key={entry.timestamp}
                  className="flex items-center justify-between rounded-lg bg-water/5 px-4 py-3"
                >
                  <span className="flex items-center gap-2">
                    <span>💧</span>
                    <span className="font-medium">+{entry.amount}ml</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hydration Tips */}
      <Card variant="water" className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <CardContent className="flex items-start gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-water/20">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <p className="font-semibold">Hydration Tip</p>
            <p className="text-sm text-muted-foreground">
              Set reminders every 2 hours to drink water. Start your day with a glass of water
              before breakfast for better hydration!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
