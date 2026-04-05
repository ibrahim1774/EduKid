import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://edukid.co';
    const { userId, email, interval = 'yearly' } = req.body || {};

    const isMonthly = interval === 'monthly';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: userId || undefined,
      customer_email: email || undefined,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: isMonthly ? 'EduKid Base Plan - Monthly' : 'EduKid Base Plan - Yearly',
            description: 'Daily Math & Reading, Custom Learning Plans, PDF Downloads & more',
          },
          unit_amount: isMonthly ? 1000 : 6000,
          recurring: { interval: isMonthly ? 'month' : 'year' },
        },
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 3,
      },
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/subscribe`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
