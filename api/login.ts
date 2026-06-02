import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('vision_therapy');
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      await client.close();
      return res.status(401).json({ message: 'User not found', status: 'error' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await client.close();
      return res.status(401).json({ message: 'Invalid password', status: 'error' });
    }

    const token = jwt.sign({ email: user.email, id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: true, // Always true for Vercel
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 hour
      })
    );

    await client.close();
    return res.status(200).json({ token, message: 'Login successful', status: 'success' });
  } catch (err: any) {
    console.error('Login error:', err);
    if (client) await client.close();
    return res.status(500).json({ 
      message: err?.message || 'Database connection error', 
      status: 'error' 
    });
  }
}
