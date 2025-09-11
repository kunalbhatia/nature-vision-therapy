import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token } = cookie.parse(req.headers.cookie || '');

  if (!token) return res.status(401).json({ isLoggedIn: false });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ isLoggedIn: true, user: decoded });
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ isLoggedIn: false });
  }
}
