import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find((u) => u.email === email);

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

    // Generate a magic link to create a session
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkError || !linkData) {
      return res.status(500).json({ error: linkError?.message || 'Failed to generate link' });
    }

    // Extract token hash from the magic link
    const actionLink = linkData.properties?.action_link;
    if (!actionLink) {
      return res.status(500).json({ error: 'No action link generated' });
    }

    const url = new URL(actionLink);
    const token_hash = url.searchParams.get('token');

    if (!token_hash) {
      return res.status(500).json({ error: 'No token in action link' });
    }

    // Verify the OTP to get a real session
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'magiclink',
    });

    if (verifyError || !verifyData.session) {
      return res.status(500).json({ error: verifyError?.message || 'Failed to create session' });
    }

    return res.status(200).json({
      access_token: verifyData.session.access_token,
      refresh_token: verifyData.session.refresh_token,
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}
