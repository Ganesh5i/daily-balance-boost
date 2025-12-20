import { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  getTodayProteinEntries,
  addProteinEntry,
  deleteProteinEntry,
  getTodayDate,
  proteinFoods,
  ProteinEntry,
  ProteinFood,
} from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const PROTEIN_GOAL = 100; // grams

export default function Protein() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<ProteinEntry[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const loadEntries = () => {
    setEntries(getTodayProteinEntries());
  };

  useEffect(() => {
    loadEntries();
    // Initialize quantities with default values
    const defaultQuantities: Record<string, number> = {};
    proteinFoods.forEach((food) => {
      defaultQuantities[food.id] = food.defaultQuantity;
    });
    setQuantities(defaultQuantities);
  }, []);

  const calculateProtein = (food: ProteinFood, quantity: number): number => {
    if (food.unit === 'piece') {
      return food.proteinPer100g * quantity;
    }
    return (food.proteinPer100g * quantity) / 100;
  };

  const handleAddFood = (food: ProteinFood) => {
    const quantity = quantities[food.id] || food.defaultQuantity;
    const protein = calculateProtein(food, quantity);

    addProteinEntry({
      foodId: food.id,
      quantity,
      protein,
      date: getTodayDate(),
    });

    loadEntries();
    toast({
      title: "Added to today's intake",
      description: `${quantity}${food.unit} ${food.name} (+${protein.toFixed(1)}g protein)`,
    });
  };

  const handleDeleteEntry = (id: string) => {
    deleteProteinEntry(id);
    loadEntries();
    toast({ title: "Entry removed" });
  };

  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
  const progress = (totalProtein / PROTEIN_GOAL) * 100;
  const isGoalMet = totalProtein >= PROTEIN_GOAL;

  // Group entries by food
  const groupedEntries = entries.reduce((acc, entry) => {
    const food = proteinFoods.find((f) => f.id === entry.foodId);
    if (food) {
      if (!acc[food.id]) {
        acc[food.id] = { food, entries: [], totalProtein: 0 };
      }
      acc[food.id].entries.push(entry);
      acc[food.id].totalProtein += entry.protein;
    }
    return acc;
  }, {} as Record<string, { food: ProteinFood; entries: ProteinEntry[]; totalProtein: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Protein Tracker</h1>
        <p className="mt-1 text-muted-foreground">Goal: {PROTEIN_GOAL}g protein per day</p>
      </div>

      {/* Progress Card */}
      <Card variant={isGoalMet ? 'protein' : 'default'} className="animate-slide-up">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Protein</p>
              <p className="text-4xl font-bold text-protein">{totalProtein.toFixed(0)}g</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isGoalMet
                  ? `Goal exceeded by ${(totalProtein - PROTEIN_GOAL).toFixed(0)}g! 🎉`
                  : `${(PROTEIN_GOAL - totalProtein).toFixed(0)}g remaining`}
              </p>
            </div>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                isGoalMet ? 'gradient-protein' : 'bg-protein/10'
              }`}
            >
              {isGoalMet ? (
                <Check className="h-8 w-8 text-protein-foreground" />
              ) : (
                <span className="text-3xl">💪</span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Progress value={Math.min(progress, 100)} variant="protein" className="h-4" />
            <p className="mt-2 text-right text-sm font-medium">
              {Math.min(progress, 100).toFixed(0)}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Log */}
      {Object.keys(groupedEntries).length > 0 && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Intake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.values(groupedEntries).map(({ food, entries, totalProtein }) => (
              <div
                key={food.id}
                className="flex items-center justify-between rounded-xl bg-protein/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{food.emoji}</span>
                  <div>
                    <p className="font-medium">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entries.length} serving{entries.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-protein">
                    +{totalProtein.toFixed(1)}g
                  </span>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => handleDeleteEntry(entries[entries.length - 1].id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Food List */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <CardHeader>
          <CardTitle>High Protein Foods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proteinFoods.map((food, index) => (
              <div
                key={food.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:border-protein/30 sm:flex-row sm:items-center sm:justify-between animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-protein/10 text-2xl">
                    {food.emoji}
                  </div>
                  <div>
                    <p className="font-medium">{food.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {food.proteinPer100g}g protein per{' '}
                      {food.unit === 'piece' ? 'piece' : `100${food.unit}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={quantities[food.id] || food.defaultQuantity}
                    onChange={(e) =>
                      setQuantities({
                        ...quantities,
                        [food.id]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-20 text-center"
                  />
                  <span className="w-12 text-sm text-muted-foreground">{food.unit}</span>
                  <Button
                    variant="protein"
                    size="sm"
                    onClick={() => handleAddFood(food)}
                    className="min-w-[80px]"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
