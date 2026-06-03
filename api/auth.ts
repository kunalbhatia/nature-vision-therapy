import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
const client = new MongoClient(uri);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  try {
    if (action === 'login') {
      if (req.method !== 'POST') return res.status(405).end();
      const { email, password } = req.body;
      await client.connect();
      const db = client.db('vision_therapy');
      const user = await db.collection('users').findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'User not found', status: 'error' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid password', status: 'error' });
      }

      const token = jwt.sign({ email: user.email, id: user._id.toString() }, JWT_SECRET, { expiresIn: '24h' });
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24,
        })
      );
      return res.status(200).json({ token, message: 'Login successful', status: 'success' });

    } else if (action === 'signup') {
      if (req.method !== 'POST') return res.status(405).end();
      const { email, password } = req.body;
      await client.connect();
      const db = client.db('vision_therapy');
      const users = db.collection('users');

      const existingUser = await users.findOne({ email });
      if (existingUser) return res.status(409).json({ message: 'Email already registered', status: 'error' });

      const hashedPassword = await bcrypt.hash(password, 10);
      await users.insertOne({ email, password: hashedPassword });
      return res.status(201).json({ message: 'Signup successful', status: 'success' });

    } else if (action === 'logout') {
      if (req.method !== 'POST') return res.status(405).end();
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 0,
        })
      );
      return res.status(200).json({ message: 'Logged out successfully', status: 'success' });

    } else if (action === 'me') {
      const { token } = cookie.parse(req.headers.cookie || '');
      if (!token) return res.status(401).json({ isLoggedIn: false });
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ isLoggedIn: true, user: decoded });
      } catch (err) {
        return res.status(401).json({ isLoggedIn: false });
      }
    }

    return res.status(404).json({ message: 'Not found' });
  } catch (err: any) {
    console.error('Auth error:', err);
    return res.status(500).json({ message: err?.message || 'Internal server error', status: 'error' });
  } finally {
    await client.close();
  }
}
