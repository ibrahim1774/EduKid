import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { access_token } = req.body || {};
  if (!access_token) {
    return res.status(400).json({ error: 'Missing access_token' });
  }

  try {
    // Get user info from Google using the access token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!googleRes.ok) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const googleUser = await googleRes.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      return res.status(400).json({ error: 'No email from Google' });
    }

    // Check if user exists in Supabase Auth
    const { data: { users } } = await supabase.auth.admin.listUsers({ filter: email });
    const existingUser = users?.[0];

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: name, avatar_url: picture },
      });
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: name, avatar_url: picture },
      });

      if (createError || !newUser.user) {
        return res.status(500).json({ error: createError?.message || 'Failed to create user' });
      }

      userId = newUser.user.id;
    }

    // Generate a magic link token server-side (does NOT send email to user)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      return res.status(500).json({ error: linkError?.message || 'Failed to generate auth link' });
    }

    // Verify the token via raw GoTrue HTTP POST (returns JSON, no redirect)
    // Using raw fetch avoids the admin client's service-role Authorization header
    // which causes GoTrue to reject user OTP verification.
    const verifyRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      body: JSON.stringify({
        email,
        token: linkData.properties.hashed_token,
        type: 'magiclink',
        redirect_to: '',
      }),
    });

    const sessionData = await verifyRes.json();

    if (!verifyRes.ok || !sessionData.access_token) {
      console.error('GoTrue verify error:', sessionData);
      return res.status(500).json({ error: sessionData.error_description || sessionData.msg || 'Failed to create session' });
    }

    return res.status(200).json({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}
