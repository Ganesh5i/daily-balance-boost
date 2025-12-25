import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Expense {
  id: string;
  item_name: string;
  category: string;
  amount: number;
  date: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  emoji: string;
  group_name: string;
}

export default function Expenses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [item, setItem] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);

    const [expensesRes, categoriesRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false }),
      supabase
        .from('expense_categories')
        .select('*')
        .order('group_name', { ascending: true }),
    ]);

    if (expensesRes.data) setExpenses(expensesRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim() || !category || !amount || !user) {
      toast({
        title: "Missing fields",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      item_name: item.trim(),
      category,
      amount: parseFloat(amount),
      date: today,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } else {
      setItem('');
      setCategory('');
      setAmount('');
      loadData();
      toast({
        title: "Expense added",
        description: `₹${amount} for ${item}`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    } else {
      loadData();
      toast({ title: "Expense deleted" });
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const categorySummary = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  // Group categories for select
  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.group_name]) acc[cat.group_name] = [];
    acc[cat.group_name].push(cat);
    return acc;
  }, {} as Record<string, ExpenseCategory[]>);

  const getCategoryEmoji = (categoryName: string) => {
    return categories.find((c) => c.name === categoryName)?.emoji || '📦';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Daily Expenses</h1>
        <p className="mt-1 text-muted-foreground">Track your daily spending</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Expense Form */}
        <Card variant="expense" className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item">Item Name</Label>
                <Input
                  id="item"
                  placeholder="e.g., Morning tea"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Object.entries(groupedCategories).map(([group, cats]) => (
                      <SelectGroup key={group}>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground">
                          {group}
                        </SelectLabel>
                        {cats.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            <span className="flex items-center gap-2">
                              <span>{cat.emoji}</span>
                              <span>{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button type="submit" variant="expense" className="w-full">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <div className="space-y-4">
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Today's Total</p>
                <p className="text-3xl font-bold text-expense">
                  ₹{totalExpense.toLocaleString()}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-expense">
                <span className="text-2xl">💰</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Summary */}
          {Object.keys(categorySummary).length > 0 && (
            <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(categorySummary).map(([cat, total]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>{getCategoryEmoji(cat)}</span>
                      <span className="text-sm font-medium">{cat}</span>
                    </span>
                    <span className="font-semibold">₹{total.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Expense List */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>Today's Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-muted-foreground">No expenses recorded today</p>
              <p className="text-sm text-muted-foreground">Add your first expense above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:bg-secondary/30 animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-expense/10 text-lg">
                      {getCategoryEmoji(expense.category)}
                    </div>
                    <div>
                      <p className="font-medium">{expense.item_name}</p>
                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-expense">
                      ₹{Number(expense.amount).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => handleDelete(expense.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
