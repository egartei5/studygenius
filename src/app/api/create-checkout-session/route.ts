// src/app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import admin from '@/lib/firebase-admin';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Missing or invalid authorization header' } },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: { message: 'Invalid or expired authentication token' } },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    const { priceId: requestedPriceId, plan } = await req.json();
    let priceId: string | undefined = requestedPriceId;

    if (!priceId && plan) {
      if (plan === 'basic') {
        priceId = process.env.BASIC_PRICE_ID;
      } else if (plan === 'pro') {
        priceId = process.env.PRO_PRICE_ID;
      }
    }

    if (!priceId) {
      return NextResponse.json(
        {
          error: {
            message:
              'Missing priceId or plan in request. (expected priceId or plan: "basic" | "pro")',
          },
        },
        { status: 400 }
      );
    }

    // Check if user already has a Stripe customer ID
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    let customerId = userData?.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to Firestore
      await db.collection('users').doc(userId).set(
        { stripeCustomerId: customerId },
        { merge: true }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?canceled=true`,
      automatic_tax: { enabled: true },
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      {
        error: {
          message: err?.message || 'Stripe checkout failed. Please try again later.',
        },
      },
      { status: 500 }
    );
  }
}
