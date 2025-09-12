import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { VercelRequest, VercelResponse } from '@vercel/node';
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  try {
    await client.connect();
    const db = client.db('vision_therapy');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email already registered', status: 'error' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({ email, password: hashedPassword });

    return res.status(201).json({ message: 'Signup successful', status: 'success' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  } finally {
    await client.close();
  }
}
