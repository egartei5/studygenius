"use client";

import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const API_BASE = '/api'; 

// Initialize firebase to get the auth instance
const { auth } = initializeFirebase();

export const stripeService = {
  createCheckoutSession: async (interval: 'month' | 'year') => {
    if (!auth.currentUser) throw new Error("Must be logged in to subscribe.");

    const token = await auth.currentUser.getIdToken();
    
    // In a real app, these would be your actual price IDs from Stripe
    const priceId = interval === 'month' 
      ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID 
      : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

    const response = await fetch(`${API_BASE}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        priceId: priceId,
        successUrl: window.location.origin + '?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: window.location.origin,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to initialize checkout.");
    }
    
    if(data.url) {
        window.location.href = data.url;
    } else {
        throw new Error("Could not retrieve checkout URL.");
    }
  },

  createPortalSession: async () => {
    if (!auth.currentUser) throw new Error("Must be logged in to manage billing.");
    const token = await auth.currentUser.getIdToken();

    const response = await fetch(`${API_BASE}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        returnUrl: window.location.href
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || "Failed to load billing portal.");
    }

    if(data.url) {
        window.location.href = data.url;
    } else {
        throw new Error("Could not retrieve portal URL.");
    }
  }
};