import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'crypto';

const PIXEL_ID = '1287427660086229';
const API_VERSION = 'v21.0';

function hashData(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessToken = process.env.FB_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('FB_ACCESS_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const {
      event_name,
      event_id,
      event_time,
      event_source_url,
      user_data = {},
      custom_data = {},
    } = req.body;

    if (!event_name || !event_id) {
      return res.status(400).json({ error: 'event_name and event_id are required' });
    }

    const serverUserData: Record<string, any> = {
      client_ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      client_user_agent: req.headers['user-agent'],
      ...(user_data.fbc && { fbc: user_data.fbc }),
      ...(user_data.fbp && { fbp: user_data.fbp }),
      ...(user_data.email && { em: hashData(user_data.email) }),
    };

    const payload = {
      data: [
        {
          event_name,
          event_id,
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_source_url,
          action_source: 'website',
          user_data: serverUserData,
          custom_data,
        },
      ],
    };

    const fbResponse = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const fbResult = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error('FB CAPI error:', fbResult);
      return res.status(fbResponse.status).json({ error: 'FB API error', details: fbResult });
    }

    return res.status(200).json({ success: true, result: fbResult });
  } catch (error) {
    console.error('FB CAPI handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
