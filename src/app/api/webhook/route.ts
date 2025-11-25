// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import admin from '@/lib/firebase-admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing for webhook routes (Stripe requires raw body)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook handler error:', errorMessage);
    return NextResponse.json(
      { error: `Webhook handler failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!customerId || !subscriptionId) {
    console.error('Missing customer or subscription in checkout session');
    return;
  }

  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Get the user ID from metadata (should be set during checkout creation)
  const userId = session.client_reference_id || session.metadata?.userId;

  if (!userId) {
    console.error('No user ID found in checkout session');
    return;
  }

  // Update user document in Firestore
  const db = admin.firestore();
  await db.collection('users').doc(userId).set(
    {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      planInterval: subscription.items.data[0]?.plan?.interval,
      currentPeriodEnd: (subscription as any).current_period_end * 1000, // Convert to milliseconds
      isPremium: subscription.status === 'active' || subscription.status === 'trialing',
    },
    { merge: true }
  );

  console.log(`Checkout completed for user ${userId}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const db = admin.firestore();
  const usersRef = db.collection('users');
  const userQuery = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

  if (userQuery.empty) {
    console.error(`No user found for customer ${customerId}`);
    return;
  }

  const userDoc = userQuery.docs[0];
  await userDoc.ref.set(
    {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planInterval: subscription.items.data[0]?.plan?.interval,
      currentPeriodEnd: (subscription as any).current_period_end * 1000,
      isPremium: subscription.status === 'active' || subscription.status === 'trialing',
    },
    { merge: true }
  );

  console.log(`Subscription ${subscription.status} for customer ${customerId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const db = admin.firestore();
  const usersRef = db.collection('users');
  const userQuery = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

  if (userQuery.empty) {
    console.error(`No user found for customer ${customerId}`);
    return;
  }

  const userDoc = userQuery.docs[0];
  await userDoc.ref.set(
    {
      subscriptionStatus: 'canceled',
      isPremium: false,
    },
    { merge: true }
  );

  console.log(`Subscription deleted for customer ${customerId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string | undefined;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const db = admin.firestore();
  const usersRef = db.collection('users');
  const userQuery = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

  if (userQuery.empty) {
    console.error(`No user found for customer ${customerId}`);
    return;
  }

  const userDoc = userQuery.docs[0];
  await userDoc.ref.set(
    {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end * 1000,
      isPremium: subscription.status === 'active' || subscription.status === 'trialing',
    },
    { merge: true }
  );

  console.log(`Payment succeeded for customer ${customerId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const db = admin.firestore();
  const usersRef = db.collection('users');
  const userQuery = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

  if (userQuery.empty) {
    console.error(`No user found for customer ${customerId}`);
    return;
  }

  const userDoc = userQuery.docs[0];
  await userDoc.ref.set(
    {
      subscriptionStatus: 'past_due',
      isPremium: false,
    },
    { merge: true }
  );

  console.log(`Payment failed for customer ${customerId}`);
}
