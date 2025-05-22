import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../lib/supabaseClient'; // Adjust path as needed

// Environment variables - these should be set in your .env.local file
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'; // Fallback for safety, but should be in env

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.error("GitHub OAuth credentials are not set in environment variables.");
}
if (JWT_SECRET === 'your-super-secret-jwt-key') {
  console.warn("Warning: JWT_SECRET is using a default fallback value. Set a strong secret in environment variables for production.");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is required.' });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).json({ error: 'GitHub OAuth credentials not configured on the server.' });
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const { access_token, error: tokenError } = tokenResponse.data;

    if (tokenError || !access_token) {
      return res.status(400).json({ error: `Error fetching GitHub access token: ${tokenError || 'No access token received.'}` });
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    const { id: github_id, email: github_email, name, login: github_login } = userResponse.data;
    const primaryEmailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${access_token}` },
    });
    const primaryEmail = primaryEmailResponse.data.find((e: any) => e.primary)?.email || github_email || `${github_id}+${github_login}@users.noreply.github.com`;


    // 3. Upsert user data into the `users` table
    let user;
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('github_id', github_id.toString())
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: row not found
      throw selectError;
    }

    if (existingUser) {
      // Update existing user if necessary (e.g., email or other details)
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ email: primaryEmail, /* other fields like name if you store them */ })
        .eq('id', existingUser.id)
        .select()
        .single();
      if (updateError) throw updateError;
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          github_id: github_id.toString(),
          email: primaryEmail,
          role: 'user', // Default role
        })
        .select()
        .single();
      if (insertError) throw insertError;
      user = newUser;
    }

    if (!user) {
        return res.status(500).json({ error: 'Failed to create or update user.' });
    }

    // 4. Generate a JWT
    const jwtPayload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      github_id: user.github_id,
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET, {
      expiresIn: '7d', // Token expiration time
    });

    // 5. Return the JWT
    res.status(200).json({ token, user: jwtPayload });

  } catch (error: any) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
