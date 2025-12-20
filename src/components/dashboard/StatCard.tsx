import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  progress?: number;
  progressLabel?: string;
  variant?: 'default' | 'water' | 'protein' | 'expense';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  progress,
  progressLabel,
  variant = 'default',
  className,
}: StatCardProps) {
  const iconColorClass = {
    default: 'bg-primary/10 text-primary',
    water: 'bg-water/10 text-water',
    protein: 'bg-protein/10 text-protein',
    expense: 'bg-expense/10 text-expense',
  }[variant];

  return (
    <Card variant={variant} className={cn('animate-slide-up', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn('rounded-xl p-3', iconColorClass)}>{icon}</div>
        </div>

        {progress !== undefined && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progressLabel}</span>
              <span className="font-semibold">{Math.min(progress, 100).toFixed(0)}%</span>
            </div>
            <Progress
              value={Math.min(progress, 100)}
              variant={variant === 'default' ? 'primary' : variant}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
