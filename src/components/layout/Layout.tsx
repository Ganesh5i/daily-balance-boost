import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
