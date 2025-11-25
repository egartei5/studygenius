"use client";

import React from 'react';
import type { User } from '@/lib/types';
import { userService } from '@/lib/user-service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { UserIcon } from '@/components/icons/UserIcon';
import { LifeBuoy, LogOut, Gem, User as UserLucide } from 'lucide-react';

interface UserMenuProps {
  user: User;
  onOpenSubscription: () => void;
  onAccountClick: () => void;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onOpenSubscription, onAccountClick, onLogout }) => {
  const hasPremium = userService.hasPremiumAccess(user);

  return (
    <div className="flex items-center space-x-4">
      {!hasPremium && (
        <Button 
            onClick={onOpenSubscription}
            size="sm"
            className="hidden md:flex bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5"
        >
            <Gem className="mr-2 h-4 w-4" />
            Upgrade
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
             <Avatar className={`h-10 w-10 ${hasPremium ? 'border-2 border-accent' : ''}`}>
                <AvatarFallback className={hasPremium ? 'bg-accent/20' : 'bg-secondary'}>
                    {hasPremium ? <CrownIcon className="h-5 w-5 text-accent" /> : <UserIcon className="h-5 w-5" />}
                </AvatarFallback>
             </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {user.email}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onAccountClick}>
                <UserLucide className="mr-2 h-4 w-4" />
                <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenSubscription}>
                <Gem className="mr-2 h-4 w-4" />
                <span>{hasPremium ? 'Manage Plan' : 'Upgrade'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
