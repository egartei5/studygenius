"use client";

import React from 'react';
import type { User } from '@/lib/types';
import { userService } from '@/lib/user-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Gem, User as UserIcon, Settings, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AccountPageProps {
  user: User;
  onLogout: () => void;
  onManagePlan: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ user, onLogout, onManagePlan }) => {
  const isPremium = userService.hasPremiumAccess(user);
  const joinDate = new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-24">
      <Card>
        <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className={`h-24 w-24 text-4xl ${isPremium ? 'border-2 border-primary' : ''}`}>
            <AvatarFallback className={isPremium ? 'bg-primary/10' : 'bg-secondary'}>
              {isPremium ? <Gem className="h-12 w-12 text-primary" /> : <UserIcon className="h-12 w-12" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-1">Member since {joinDate}</p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant={isPremium ? "default" : "secondary"} className={isPremium ? "bg-primary/80" : ""}>{isPremium ? 'Premium Plan' : 'Free Plan'}</Badge>
                  {isPremium && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300">Active</Badge>
                  )}
              </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button onClick={onManagePlan}>
                  <Gem className="mr-2 h-4 w-4" />
                  {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
              </Button>
              <Button onClick={onLogout} variant="outline">
                  Log Out
              </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardDescription>Study Sets Generated</CardDescription>
                <CardTitle className="text-4xl font-bold">{user.stats?.setsGenerated || 0}</CardTitle>
            </CardHeader>
        </Card>
        <Card>
            <CardHeader>
                <CardDescription>Questions Answered</CardDescription>
                <CardTitle className="text-4xl font-bold">{user.stats?.questionsAnswered || 0}</CardTitle>
            </CardHeader>
        </Card>
        <Card>
            <CardHeader>
                <CardDescription>Current Day Streak</CardDescription>
                <CardTitle className="text-4xl font-bold">{user.stats?.daysStreak || 0}</CardTitle>
            </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> App Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="notifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive study reminders and updates.</p>
                </div>
                <Switch id="notifications" checked disabled />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                 <div>
                    <Label htmlFor="delete-account" className="font-medium text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                </div>
                <Button variant="destructive" disabled><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
