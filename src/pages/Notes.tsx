import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns';

interface Note {
  id: string;
  content: string;
  is_completed: boolean;
  date: string;
  created_at: string;
}

export default function Notes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, selectedDate]);

  const loadNotes = async () => {
    if (!user) return;
    setIsLoading(true);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading notes:', error);
    } else {
      setNotes(data || []);
    }
    setIsLoading(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      content: newNote.trim(),
      date: dateStr,
      is_completed: false,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    } else {
      setNewNote('');
      loadNotes();
      toast({
        title: 'Note added',
        description: 'Task added to your list',
      });
    }
  };

  const handleToggleComplete = async (note: Note) => {
    const { error } = await supabase
      .from('notes')
      .update({ is_completed: !note.is_completed })
      .eq('id', note.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update note',
        variant: 'destructive',
      });
    } else {
      loadNotes();
    }
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    } else {
      loadNotes();
      toast({ title: 'Note deleted' });
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  };

  const completedCount = notes.filter((n) => n.is_completed).length;
  const totalCount = notes.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Notes & To-Do</h1>
        <p className="mt-1 text-muted-foreground">Date-specific task management</p>
      </div>

      {/* Date Navigation */}
      <Card className="animate-slide-up">
        <CardContent className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">{getDateLabel(selectedDate)}</span>
            {!isToday(selectedDate) && (
              <span className="text-sm text-muted-foreground">
                ({format(selectedDate, 'MMM d, yyyy')})
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Jump */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={isToday(selectedDate) ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </Button>
        <Button
          variant={isTomorrow(selectedDate) ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDate(addDays(new Date(), 1))}
        >
          Tomorrow
        </Button>
        {[2, 3, 4, 5, 6].map((days) => {
          const date = addDays(new Date(), days);
          return (
            <Button
              key={days}
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(date)}
              className="whitespace-nowrap"
            >
              {format(date, 'EEE, MMM d')}
            </Button>
          );
        })}
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {completedCount} / {totalCount}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    tasks completed
                  </span>
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground">
                {Math.round(progress)}%
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Note Form */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddNote} className="flex gap-2">
            <Input
              placeholder="What do you need to do?"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newNote.trim()}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>Tasks for {getDateLabel(selectedDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : notes.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="text-2xl">📝</span>
              </div>
              <p className="font-medium text-muted-foreground">No tasks for this day</p>
              <p className="text-sm text-muted-foreground">Add a task above to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div
                  key={note.id}
                  className={`flex items-center gap-3 rounded-xl border p-4 transition-all animate-scale-in ${
                    note.is_completed ? 'bg-muted/50' : 'bg-card hover:bg-secondary/30'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Checkbox
                    checked={note.is_completed}
                    onCheckedChange={() => handleToggleComplete(note)}
                    className="h-5 w-5"
                  />
                  <span
                    className={`flex-1 ${
                      note.is_completed ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {note.content}
                  </span>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
