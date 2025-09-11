import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = JSON.parse(req.body);

  try {
    await client.connect();
    const db = client.db('vision_therapy');
    const user = await db.collection('users').findOne({ email });

    if (!user) return res.status(401).json({ message: 'User not found', status: 'error' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid password', status: 'error' });

    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60, // 15 minutes
      })
    );

    return res.status(200).json({ token, message: 'Login successful', status: 'success' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server error', status: 'error' });
  } finally {
    await client.close();
  }
}
