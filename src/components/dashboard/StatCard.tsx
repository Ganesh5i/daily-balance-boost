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
  variant?: 'default' | 'water' | 'protein' | 'expense' | 'notes';
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
    default: 'bg-primary/12 text-primary',
    water: 'bg-water/15 text-water',
    protein: 'bg-protein/15 text-protein',
    expense: 'bg-expense/15 text-expense',
    notes: 'bg-notes/15 text-notes',
  }[variant];

  const valueColorClass = {
    default: 'text-primary',
    water: 'text-water',
    protein: 'text-protein',
    expense: 'text-expense',
    notes: 'text-notes',
  }[variant];

  return (
    <Card variant={variant} className={cn('animate-slide-up', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                'stat-number mt-1.5 text-[2.75rem] font-bold leading-none tracking-tight',
                valueColorClass
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              iconColorClass
            )}
          >
            {icon}
          </div>
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
              className="h-2.5"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
