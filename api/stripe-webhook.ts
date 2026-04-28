import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createHash } from 'crypto';

export const config = { api: { bodyParser: false } };

const PIXEL_ID = '26490568997297314';
const API_VERSION = 'v21.0';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function hashData(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

async function readRaw(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function fireMetaPurchase(opts: {
  email: string;
  value: number;
  currency: string;
  eventId: string;
}): Promise<void> {
  const accessToken = process.env.FB_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('FB_ACCESS_TOKEN not configured — skipping Purchase event');
    return;
  }

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_id: opts.eventId,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: opts.email ? { em: [hashData(opts.email)] } : {},
        custom_data: {
          value: opts.value,
          currency: opts.currency,
          content_name: 'Base Plan',
        },
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error('Meta CAPI Purchase failed:', res.status, body);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const signature = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    const rawBody = await readRaw(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      // Only fire Purchase for real money invoices.
      // Trial creation invoice has amount_paid: 0 → ignored (StartTrial fires client-side instead).
      // First charge after trial conversion + recurring renewals have amount_paid > 0.
      if (invoice.amount_paid > 0) {
        let email = invoice.customer_email ?? '';
        if (!email && invoice.customer) {
          try {
            const customer = await stripe.customers.retrieve(invoice.customer as string);
            if (customer && !customer.deleted) {
              email = (customer as Stripe.Customer).email ?? '';
            }
          } catch (e) {
            console.error('Failed to retrieve customer for email:', e);
          }
        }

        await fireMetaPurchase({
          email,
          value: invoice.amount_paid / 100,
          currency: invoice.currency.toUpperCase(),
          eventId: `purchase_${invoice.id}`,
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler error' });
  }
}
