import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../lib/supabaseClient'; // Adjust path as needed

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'; // Fallback for safety

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing.' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization header format. Expected "Bearer <token>".' });
  }

  const token = tokenParts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user_id: string; email: string; role: string; github_id: string; iat: number; exp: number };

    // Optionally, you can fetch fresh user data from the database
    // This is useful if user details (like role) can change and you want the latest info
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, github_id, created_at') // Select specific fields to return
      .eq('id', decoded.user_id)
      .single();

    if (error || !user) {
      console.error('Error fetching user for /api/auth/me or user not found:', error?.message);
      return res.status(404).json({ error: 'User not found or error fetching user details.' });
    }

    // Return user information
    // You can choose to return the full user object or just the decoded token claims
    res.status(200).json({ user });

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    console.error('/api/auth/me JWT verification error:', error.message);
    res.status(500).json({ error: 'Internal server error during token verification.' });
  }
}
