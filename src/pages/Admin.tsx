import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Shield, Users, Apple, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ExpenseCategory {
  id: string;
  name: string;
  emoji: string;
  group_name: string;
}

interface ProteinFood {
  id: string;
  name: string;
  protein_per_unit: number;
  unit: string;
  sort_order: number;
}

interface UserWithRole {
  user_id: string;
  email: string;
  role: string;
}

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [proteinFoods, setProteinFoods] = useState<ProteinFood[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New category form
  const [newCategory, setNewCategory] = useState({ name: '', emoji: '📦', group_name: '' });
  // New protein food form
  const [newProteinFood, setNewProteinFood] = useState({ name: '', protein_per_unit: 0, unit: '100g' });
  // New admin email
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Editing states
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editingFood, setEditingFood] = useState<ProteinFood | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, foodRes] = await Promise.all([
        supabase.from('expense_categories').select('*').order('group_name', { ascending: true }),
        supabase.from('protein_foods').select('*').order('sort_order', { ascending: true }),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (foodRes.data) setProteinFoods(foodRes.data);

      // Load users with roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email');

      if (rolesData && profilesData) {
        const usersWithRoles = rolesData.map((role) => {
          const profile = profilesData.find((p) => p.user_id === role.user_id);
          return {
            user_id: role.user_id,
            email: profile?.email || 'Unknown',
            role: role.role,
          };
        });
        setUsers(usersWithRoles);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Category handlers
  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.group_name) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('expense_categories').insert(newCategory);
    if (error) {
      toast({ title: 'Error adding category', description: error.message, variant: 'destructive' });
    } else {
      setNewCategory({ name: '', emoji: '📦', group_name: '' });
      loadData();
      toast({ title: 'Category added' });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    const { error } = await supabase
      .from('expense_categories')
      .update({
        name: editingCategory.name,
        emoji: editingCategory.emoji,
        group_name: editingCategory.group_name,
      })
      .eq('id', editingCategory.id);

    if (error) {
      toast({ title: 'Error updating category', variant: 'destructive' });
    } else {
      setEditingCategory(null);
      loadData();
      toast({ title: 'Category updated' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('expense_categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting category', variant: 'destructive' });
    } else {
      loadData();
      toast({ title: 'Category deleted' });
    }
  };

  // Protein food handlers
  const handleAddProteinFood = async () => {
    if (!newProteinFood.name || !newProteinFood.protein_per_unit) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('protein_foods').insert({
      ...newProteinFood,
      sort_order: proteinFoods.length + 1,
    });

    if (error) {
      toast({ title: 'Error adding protein food', description: error.message, variant: 'destructive' });
    } else {
      setNewProteinFood({ name: '', protein_per_unit: 0, unit: '100g' });
      loadData();
      toast({ title: 'Protein food added' });
    }
  };

  const handleUpdateProteinFood = async () => {
    if (!editingFood) return;

    const { error } = await supabase
      .from('protein_foods')
      .update({
        name: editingFood.name,
        protein_per_unit: editingFood.protein_per_unit,
        unit: editingFood.unit,
      })
      .eq('id', editingFood.id);

    if (error) {
      toast({ title: 'Error updating protein food', variant: 'destructive' });
    } else {
      setEditingFood(null);
      loadData();
      toast({ title: 'Protein food updated' });
    }
  };

  const handleDeleteProteinFood = async (id: string) => {
    const { error } = await supabase.from('protein_foods').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting protein food', variant: 'destructive' });
    } else {
      loadData();
      toast({ title: 'Protein food deleted' });
    }
  };

  // Admin user handlers
  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      toast({ title: 'Please enter an email', variant: 'destructive' });
      return;
    }

    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', newAdminEmail)
      .maybeSingle();

    if (!profile) {
      toast({
        title: 'User not found',
        description: 'No user found with that email. They must sign up first.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('user_roles').insert({
      user_id: profile.user_id,
      role: 'admin',
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'User is already an admin', variant: 'destructive' });
      } else {
        toast({ title: 'Error adding admin', description: error.message, variant: 'destructive' });
      }
    } else {
      setNewAdminEmail('');
      loadData();
      toast({ title: 'Admin added successfully' });
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (userId === user?.id) {
      toast({ title: 'Cannot remove yourself', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) {
      toast({ title: 'Error removing admin', variant: 'destructive' });
    } else {
      loadData();
      toast({ title: 'Admin removed' });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.group_name]) acc[cat.group_name] = [];
    acc[cat.group_name].push(cat);
    return acc;
  }, {} as Record<string, ExpenseCategory[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Admin Panel</h1>
          <p className="text-muted-foreground">Manage categories, foods, and users</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="protein" className="flex items-center gap-2">
            <Apple className="h-4 w-4" />
            Protein Foods
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admins
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <Label>Name</Label>
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>
                <div className="w-20">
                  <Label>Emoji</Label>
                  <Input
                    placeholder="📦"
                    value={newCategory.emoji}
                    onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label>Group</Label>
                  <Input
                    placeholder="Food & Beverages"
                    value={newCategory.group_name}
                    onChange={(e) => setNewCategory({ ...newCategory, group_name: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(groupedCategories).map(([group, cats]) => (
            <Card key={group} className="animate-slide-up">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{group}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cats.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      {editingCategory?.id === cat.id ? (
                        <>
                          <Input
                            value={editingCategory.emoji}
                            onChange={(e) => setEditingCategory({ ...editingCategory, emoji: e.target.value })}
                            className="w-16"
                          />
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleUpdateCategory}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingCategory(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">{cat.emoji}</span>
                          <span className="flex-1 font-medium">{cat.name}</span>
                          <Button size="sm" variant="ghost" onClick={() => setEditingCategory(cat)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Protein Foods Tab */}
        <TabsContent value="protein" className="space-y-4">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Add New Protein Food</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <Label>Name</Label>
                  <Input
                    placeholder="Chicken breast"
                    value={newProteinFood.name}
                    onChange={(e) => setNewProteinFood({ ...newProteinFood, name: e.target.value })}
                  />
                </div>
                <div className="w-32">
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="31"
                    value={newProteinFood.protein_per_unit || ''}
                    onChange={(e) => setNewProteinFood({ ...newProteinFood, protein_per_unit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="w-32">
                  <Label>Unit</Label>
                  <Input
                    placeholder="100g"
                    value={newProteinFood.unit}
                    onChange={(e) => setNewProteinFood({ ...newProteinFood, unit: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddProteinFood}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Protein Foods List</CardTitle>
              <CardDescription>{proteinFoods.length} foods in database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {proteinFoods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {editingFood?.id === food.id ? (
                      <>
                        <Input
                          value={editingFood.name}
                          onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={editingFood.protein_per_unit}
                          onChange={(e) => setEditingFood({ ...editingFood, protein_per_unit: parseFloat(e.target.value) || 0 })}
                          className="w-20"
                        />
                        <Input
                          value={editingFood.unit}
                          onChange={(e) => setEditingFood({ ...editingFood, unit: e.target.value })}
                          className="w-24"
                        />
                        <Button size="sm" onClick={handleUpdateProteinFood}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingFood(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{food.name}</span>
                        <span className="text-protein font-semibold">{food.protein_per_unit}g</span>
                        <span className="text-muted-foreground">/ {food.unit}</span>
                        <Button size="sm" variant="ghost" onClick={() => setEditingFood(food)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteProteinFood(food.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Add Admin User</CardTitle>
              <CardDescription>
                Enter the email of a registered user to grant admin access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddAdmin}>
                  <Plus className="h-4 w-4" /> Add Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                {users.filter((u) => u.role === 'admin').length} admins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users
                  .filter((u) => u.role === 'admin')
                  .map((u) => (
                    <div
                      key={u.user_id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
                          <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{u.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.user_id === user?.id ? 'You' : 'Admin'}
                          </p>
                        </div>
                      </div>
                      {u.user_id !== user?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleRemoveAdmin(u.user_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
