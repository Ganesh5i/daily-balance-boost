import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="min-h-screen pt-16 lg:pl-72 lg:pt-0">
        <div className="container mx-auto max-w-5xl px-4 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
