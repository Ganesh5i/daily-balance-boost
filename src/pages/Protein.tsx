import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Check, Star, Search, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProteinFood {
  id: string;
  name: string;
  protein_per_unit: number;
  unit: string;
  category: string;
  emoji: string;
  default_quantity: number;
  sort_order: number;
}

interface ProteinEntry {
  id: string;
  food_name: string;
  quantity: number;
  protein_amount: number;
}

// My Daily Foods — always shown first in this exact order
const DAILY_FOODS_ORDER = [
  'Eggs (whole)',
  'Milk',
  'Curd (yogurt)',
  'Oats',
  'Soy chunks',
  'Chickpeas (chana)',
  'Green Gram (Dry / Moong)',
  'Almonds',
  'Cashews',
  'Cooked White Rice',
];

const CATEGORY_ORDER = [
  'My Daily Foods',
  'Animal Protein',
  'Dairy',
  'Soy',
  'Pulses & Legumes',
  'Grains',
  'Nuts & Seeds',
  'Indian Foods',
  'Vegetables',
  'Fruits',
];

const CATEGORY_ICONS: Record<string, string> = {
  'My Daily Foods': '⭐',
  'Animal Protein': '🥩',
  'Dairy': '🥛',
  'Soy': '🌱',
  'Pulses & Legumes': '🫘',
  'Grains': '🌾',
  'Nuts & Seeds': '🥜',
  'Indian Foods': '🍽',
  'Vegetables': '🥦',
  'Fruits': '🍎',
};

const FAVORITES_KEY = 'protein_favorites';
const GOAL_KEY = 'protein_goal';
const DEFAULT_GOAL = 100;

export default function Protein() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ProteinEntry[]>([]);
  const [foods, setFoods] = useState<ProteinFood[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number | ''>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [proteinGoal, setProteinGoal] = useState(DEFAULT_GOAL);
  const [editingGoal, setEditingGoal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Load favorites, quantities, and goal from localStorage
  useEffect(() => {
    try {
      const favs = localStorage.getItem(FAVORITES_KEY);
      if (favs) setFavorites(new Set(JSON.parse(favs)));
      const g = localStorage.getItem(GOAL_KEY);
      if (g) setProteinGoal(parseInt(g, 10) || DEFAULT_GOAL);
    } catch (e) {
      console.error('localStorage read error', e);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    const [entriesRes, foodsRes] = await Promise.all([
      supabase
        .from('protein_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false }),
      supabase
        .from('protein_foods')
        .select('*')
        .order('sort_order', { ascending: true }),
    ]);

    if (entriesRes.data) setEntries(entriesRes.data);
    if (foodsRes.data) {
      setFoods(foodsRes.data as ProteinFood[]);
      // Always start with empty inputs
      setQuantities({});
    }
    setIsLoading(false);
  };


  const toggleFavorite = (foodName: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(foodName)) next.delete(foodName);
      else next.add(foodName);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const saveGoal = (value: number) => {
    const v = Math.max(1, Math.min(1000, value));
    setProteinGoal(v);
    localStorage.setItem(GOAL_KEY, String(v));
    setEditingGoal(false);
  };

  const calculateProtein = (food: ProteinFood, quantity: number): number => {
    const unit = (food.unit || '').toLowerCase();
    // per-piece / per-scoop / per-egg units use direct multiplication
    if (
      unit.includes('egg') ||
      unit.includes('scoop') ||
      unit.includes('piece') ||
      unit === '1 egg'
    ) {
      return food.protein_per_unit * quantity;
    }
    // per 100g / 100ml — quantity is in grams/ml
    return (food.protein_per_unit * quantity) / 100;
  };

  const handleAddFood = async (food: ProteinFood) => {
    if (!user) return;
    const quantity = Number(quantities[food.id]) || Number(food.default_quantity) || 100;
    const proteinAmount = calculateProtein(food, quantity);

    const { error } = await supabase.from('protein_entries').insert({
      user_id: user.id,
      food_name: food.name,
      quantity,
      protein_amount: proteinAmount,
      date: today,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add', variant: 'destructive' });
    } else {
      // Clear the quantity input and refocus it for the next entry
      setQuantities((prev) => ({ ...prev, [food.id]: '' }));
      requestAnimationFrame(() => {
        const el = inputRefs.current[food.id];
        el?.focus();
        el?.select();
      });
      loadData();
      toast({
        title: 'Added',
        description: `${quantity} ${food.unit} ${food.name} (+${proteinAmount.toFixed(1)}g)`,
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase.from('protein_entries').delete().eq('id', id);
    if (!error) {
      loadData();
      toast({ title: 'Entry removed' });
    }
  };

  const totalProtein = entries.reduce((sum, e) => sum + Number(e.protein_amount), 0);
  const remaining = Math.max(0, proteinGoal - totalProtein);
  const progress = Math.min(100, (totalProtein / proteinGoal) * 100);
  const isGoalMet = totalProtein >= proteinGoal;

  // Build sections: show only favorite foods
  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = (f: ProteinFood) => !q || f.name.toLowerCase().includes(q);

    const list = foods.filter(matches);
    if (list.length === 0) return [];
    return [{ category: 'My Daily Foods', foods: list }];
  }, [foods, search]);

  // Today's grouped entries
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.food_name]) acc[entry.food_name] = { entries: [], totalProtein: 0 };
    acc[entry.food_name].entries.push(entry);
    acc[entry.food_name].totalProtein += Number(entry.protein_amount);
    return acc;
  }, {} as Record<string, { entries: ProteinEntry[]; totalProtein: number }>);

  const getPlaceholder = (food: ProteinFood) => {
    const unit = (food.unit || '').toLowerCase();
    if (unit.includes('egg')) return 'Enter number of eggs';
    if (unit.includes('ml')) return 'Enter ml';
    return 'Enter grams (g)';
  };

  const getUnitLabel = (food: ProteinFood) => {
    const unit = (food.unit || '').toLowerCase();
    if (unit.includes('ml')) return 'ml';
    if (unit.includes('egg')) return 'eggs';
    if (unit.includes('scoop')) return 'scoop';
    if (unit.includes('piece')) return 'pcs';
    return 'g';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Protein Tracker</h1>
          <p className="mt-1 text-muted-foreground">Track your daily protein intake</p>
        </div>
      </div>

      {/* Progress Card */}
      <Card variant={isGoalMet ? 'protein' : 'default'} className="animate-slide-up">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Today's Protein</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="stat-number text-4xl font-bold text-protein">{totalProtein.toFixed(0)}</p>
                <span className="text-2xl font-semibold text-muted-foreground">/</span>
                {editingGoal ? (
                  <Input
                    type="number"
                    autoFocus
                    defaultValue={proteinGoal}
                    onBlur={(e) => saveGoal(parseInt(e.target.value, 10) || DEFAULT_GOAL)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveGoal(parseInt((e.target as HTMLInputElement).value, 10) || DEFAULT_GOAL);
                      if (e.key === 'Escape') setEditingGoal(false);
                    }}
                    className="w-24 text-2xl font-semibold"
                  />
                ) : (
                  <button
                    onClick={() => setEditingGoal(true)}
                    className="text-2xl font-semibold text-muted-foreground hover:text-protein"
                    title="Click to change goal"
                  >
                    {proteinGoal}g
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Remaining:{' '}
                  <span className="font-semibold text-foreground">
                    {remaining.toFixed(0)}g
                  </span>
                </span>
                {isGoalMet && (
                  <span className="rounded-full bg-protein/10 px-2 py-0.5 text-xs font-medium text-protein">
                    🎉 Goal met
                  </span>
                )}
              </div>
            </div>
            <div
              className={cn(
                'flex h-16 w-16 shrink-0 items-center justify-center rounded-md',
                isGoalMet ? 'bg-protein' : 'bg-protein/10'
              )}
            >
              {isGoalMet ? (
                <Check className="h-8 w-8 text-protein-foreground" />
              ) : (
                <span className="text-3xl">💪</span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} variant="protein" className="h-4" />
            <p className="mt-2 text-right text-sm font-medium">{progress.toFixed(0)}%</p>
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
            {Object.entries(groupedEntries).map(([foodName, { entries: es, totalProtein: tp }]) => (
              <div
                key={foodName}
                className="flex items-center justify-between rounded-md bg-protein/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {foods.find((f) => f.name === foodName)?.emoji || '💪'}
                  </span>
                  <div>
                    <p className="font-medium">{foodName}</p>
                    <p className="text-xs text-muted-foreground">
                      {es.length} serving{es.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-protein">+{tp.toFixed(1)}g</span>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => handleDeleteEntry(es[es.length - 1].id)}
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

      {/* Search */}
      <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sections */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No foods match "{search}"
          </CardContent>
        </Card>
      ) : (
        sections.map((section, sIdx) => (
          <Card key={section.category} className="animate-slide-up" style={{ animationDelay: `${0.2 + sIdx * 0.05}s` }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{CATEGORY_ICONS[section.category] || '🍽'}</span>
                <span>{section.category}</span>
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                  {section.foods.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.foods.map((food) => {
                  const isFav = favorites.has(food.name);
                  const unitLabel = getUnitLabel(food);
                  return (
                    <div
                      key={`${section.category}-${food.id}`}
                      className="flex flex-col gap-3 rounded-md border bg-card p-4 transition-all hover:border-protein/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-protein/10 text-2xl">
                          {food.emoji || '💪'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{food.name}</p>
                            <button
                              onClick={() => toggleFavorite(food.name)}
                              className={cn(
                                'shrink-0 transition-colors',
                                isFav ? 'text-yellow-500' : 'text-muted-foreground/40 hover:text-yellow-500'
                              )}
                              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Star className={cn('h-4 w-4', isFav && 'fill-current')} />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {food.protein_per_unit}g protein per {food.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          ref={(el) => {
                            inputRefs.current[food.id] = el;
                          }}
                          type="number"
                          min="0"
                          placeholder={getPlaceholder(food)}
                          value={quantities[food.id] ?? ''}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [food.id]: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddFood(food);
                          }}
                          onFocus={() =>
                            setQuantities((prev) => ({ ...prev, [food.id]: '' }))
                          }
                          className="w-44 text-center"
                        />
                        <span className="w-10 text-sm text-muted-foreground">{unitLabel}</span>
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
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
