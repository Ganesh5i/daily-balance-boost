import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Wallet, Drumstick, Droplets, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';

interface DayData {
  date: Date;
  expenses: number;
  protein: number;
  water: number;
  notes: number;
  hasData: boolean;
}

const PROTEIN_GOAL = 100;
const WATER_GOAL = 4000;

export default function Analysis() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayData, setDayData] = useState<Record<string, DayData>>({});
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  useEffect(() => {
    if (user) {
      loadMonthData();
    }
  }, [user, currentMonth]);

  const loadMonthData = async () => {
    if (!user) return;
    setIsLoading(true);

    const startDate = format(monthStart, 'yyyy-MM-dd');
    const endDate = format(monthEnd, 'yyyy-MM-dd');

    try {
      const [expensesRes, proteinRes, waterRes, notesRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('date, amount')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('protein_entries')
          .select('date, protein_amount')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('water_entries')
          .select('date, amount_ml')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('notes')
          .select('date')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate),
      ]);

      const data: Record<string, DayData> = {};

      // Initialize all days
      daysInMonth.forEach((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        data[dateKey] = {
          date: day,
          expenses: 0,
          protein: 0,
          water: 0,
          notes: 0,
          hasData: false,
        };
      });

      // Aggregate expenses
      expensesRes.data?.forEach((e) => {
        if (data[e.date]) {
          data[e.date].expenses += Number(e.amount);
          data[e.date].hasData = true;
        }
      });

      // Aggregate protein
      proteinRes.data?.forEach((e) => {
        if (data[e.date]) {
          data[e.date].protein += Number(e.protein_amount);
          data[e.date].hasData = true;
        }
      });

      // Aggregate water
      waterRes.data?.forEach((e) => {
        if (data[e.date]) {
          data[e.date].water += Number(e.amount_ml);
          data[e.date].hasData = true;
        }
      });

      // Count notes
      notesRes.data?.forEach((e) => {
        if (data[e.date]) {
          data[e.date].notes += 1;
          data[e.date].hasData = true;
        }
      });

      setDayData(data);
    } catch (error) {
      console.error('Error loading month data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (value: number, goal: number) => {
    const percentage = (value / goal) * 100;
    if (percentage >= 100) return 'bg-protein';
    if (percentage >= 75) return 'bg-water';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-muted';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Analysis</h1>
        <p className="mt-1 text-muted-foreground">Day-by-day tracking overview</p>
      </div>

      {/* Month Navigation */}
      <Card className="animate-slide-up">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding for first week */}
            {paddingDays.map((_, i) => (
              <div key={`padding-${i}`} className="aspect-square" />
            ))}

            {/* Days */}
            {daysInMonth.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const data = dayData[dateKey];
              const isSelected = selectedDay && isSameDay(day, selectedDay.date);
              
              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDay(data || null)}
                  className={`relative aspect-square rounded-lg border p-1 text-center transition-all hover:border-primary ${
                    isToday(day) ? 'border-primary bg-primary/5' : ''
                  } ${isSelected ? 'border-primary ring-2 ring-primary/30' : ''} ${
                    !data?.hasData ? 'opacity-50' : ''
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday(day) ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {data?.hasData && (
                    <div className="absolute bottom-1 left-1 right-1 flex gap-0.5">
                      {data.expenses > 0 && (
                        <div className="h-1 flex-1 rounded-full bg-expense" />
                      )}
                      {data.protein > 0 && (
                        <div className={`h-1 flex-1 rounded-full ${getProgressColor(data.protein, PROTEIN_GOAL)}`} />
                      )}
                      {data.water > 0 && (
                        <div className={`h-1 flex-1 rounded-full ${getProgressColor(data.water, WATER_GOAL)}`} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-expense" /> Expenses
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-protein" /> Protein (Goal met)
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-water" /> Progress
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      {selectedDay && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDay.hasData ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-expense/10 p-4">
                  <div className="flex items-center gap-2 text-expense">
                    <Wallet className="h-5 w-5" />
                    <span className="text-sm font-medium">Expenses</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">₹{selectedDay.expenses.toLocaleString()}</p>
                </div>
                
                <div className="rounded-xl bg-protein/10 p-4">
                  <div className="flex items-center gap-2 text-protein">
                    <Drumstick className="h-5 w-5" />
                    <span className="text-sm font-medium">Protein</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{selectedDay.protein.toFixed(0)}g</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDay.protein >= PROTEIN_GOAL ? 'Goal achieved! ✓' : `${(PROTEIN_GOAL - selectedDay.protein).toFixed(0)}g short`}
                  </p>
                </div>
                
                <div className="rounded-xl bg-water/10 p-4">
                  <div className="flex items-center gap-2 text-water">
                    <Droplets className="h-5 w-5" />
                    <span className="text-sm font-medium">Water</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{(selectedDay.water / 1000).toFixed(1)}L</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDay.water >= WATER_GOAL ? 'Goal achieved! ✓' : `${((WATER_GOAL - selectedDay.water) / 1000).toFixed(1)}L short`}
                  </p>
                </div>
                
                <div className="rounded-xl bg-primary/10 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{selectedDay.notes}</p>
                  <p className="text-xs text-muted-foreground">tasks for this day</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">No records for this day</p>
                <p className="text-sm text-muted-foreground">Start tracking to see your data here</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Monthly Summary */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-expense">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium">Total Expenses</span>
              </div>
              <p className="mt-2 text-3xl font-bold">
                ₹{Object.values(dayData).reduce((sum, d) => sum + d.expenses, 0).toLocaleString()}
              </p>
            </div>
            
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-protein">
                <Drumstick className="h-5 w-5" />
                <span className="text-sm font-medium">Days Goal Met (Protein)</span>
              </div>
              <p className="mt-2 text-3xl font-bold">
                {Object.values(dayData).filter((d) => d.protein >= PROTEIN_GOAL).length}
                <span className="text-lg text-muted-foreground"> / {daysInMonth.length}</span>
              </p>
            </div>
            
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-water">
                <Droplets className="h-5 w-5" />
                <span className="text-sm font-medium">Days Goal Met (Water)</span>
              </div>
              <p className="mt-2 text-3xl font-bold">
                {Object.values(dayData).filter((d) => d.water >= WATER_GOAL).length}
                <span className="text-lg text-muted-foreground"> / {daysInMonth.length}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
