"use client";

import type React from 'react';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { UserMenu } from '@/components/user-menu';
import type { User, Theme } from '@/lib/types';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  theme: Theme;
  toggleTheme: () => void;
  onOpenSubscription: () => void;
  onNavigateHome: () => void;
  onNavigateAccount: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  theme, 
  toggleTheme, 
  onOpenSubscription, 
  onNavigateHome, 
  onNavigateAccount, 
  onLogout 
}) => {
  return (
    <header className="sticky top-0 z-30 border-b bg-card text-card-foreground shadow-sm transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button onClick={onNavigateHome} className="group flex items-center space-x-3 focus:outline-none">
             <LogoIcon className="h-8 w-8 text-primary transition-colors group-hover:text-primary/90" />
            <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground">
              StudyGenius
            </h1>
          </button>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={toggleTheme}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle Dark Mode"
            >
                {theme === 'light' ? (
                    <Moon className="h-5 w-5" />
                ) : (
                    <Sun className="h-5 w-5" />
                )}
            </button>

            {user && (
                <UserMenu 
                    user={user} 
                    onOpenSubscription={onOpenSubscription} 
                    onAccountClick={onNavigateAccount}
                    onLogout={onLogout}
                />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
