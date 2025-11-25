"use client";

import React, { useState } from 'react';
import type { User, PlanInterval } from '@/lib/types';
import { userService } from '@/lib/user-service';
import { stripeService } from '@/lib/stripe-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (user: User) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, user }) => {
  const [billingInterval, setBillingInterval] = useState<PlanInterval>('month');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasAccess = userService.hasPremiumAccess(user);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await stripeService.createCheckoutSession(billingInterval);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Checkout Error", description: e.message || "Failed to initiate checkout. Please try again.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleManage = async () => {
      setIsLoading(true);
      try {
          await stripeService.createPortalSession();
      } catch (e: any) {
          console.error(e);
          toast({ title: "Billing Error", description: e.message || "Failed to open billing portal.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
  };

  const renderPlanSelection = () => (
    <>
      <DialogHeader className="text-center">
        <DialogTitle className="text-2xl font-headline">Upgrade to Premium</DialogTitle>
        <DialogDescription>Unlock the full potential of your study sessions.</DialogDescription>
      </DialogHeader>
      
      <div className="flex justify-center pt-2 pb-6">
          <Tabs defaultValue="month" onValueChange={(value) => setBillingInterval(value as PlanInterval)}>
            <TabsList>
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="year">Yearly <span className="ml-2 rounded-md bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-700 dark:text-green-300">-20%</span></TabsTrigger>
            </TabsList>
          </Tabs>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground">$0 <span className="text-sm font-normal text-muted-foreground">/ forever</span></CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-3">
                <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                    <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Basic Study Sets</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Max 5 Items per topic</li>
                    <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Standard AI Model</li>
                </ul>
                <Button disabled variant="secondary" className="w-full mt-4">Current Plan</Button>
            </CardContent>
        </Card>

        <Card className="flex flex-col border-primary ring-2 ring-primary relative">
             <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Premium <Gem className="h-5 w-5 text-primary" /></CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground">
                    {billingInterval === 'month' ? '$9.99' : '$99.99'}
                    <span className="text-sm font-normal text-muted-foreground">/{billingInterval}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-3">
                <ul className="space-y-3 text-sm text-foreground flex-1">
                    <li className="flex items-center font-medium"><Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" /> Unlimited Study Sets</li>
                    <li className="flex items-center font-medium"><Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" /> Up to 70 Items per topic</li>
                    <li className="flex items-center font-medium"><Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" /> Advanced AI Model</li>
                    <li className="flex items-center font-medium"><Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" /> Priority Support</li>
                </ul>
                <Button onClick={handleSubscribe} disabled={isLoading} className="w-full mt-4">
                    {isLoading ? 'Redirecting...' : `Subscribe ${billingInterval === 'month' ? 'Monthly' : 'Yearly'}`}
                </Button>
            </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {hasAccess && user.subscriptionStatus !== 'canceled'
            ? (
                <div className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Gem className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline">Premium Active</h2>
                    <p className="text-muted-foreground mb-6">Manage your subscription details and billing via the secure portal.</p>
                    <Button 
                        onClick={handleManage}
                        disabled={isLoading}
                        size="lg"
                    >
                        {isLoading ? 'Loading...' : 'Open Billing Portal'}
                    </Button>
                </div>
            )
            : renderPlanSelection()
        }
      </DialogContent>
    </Dialog>
  );
};
