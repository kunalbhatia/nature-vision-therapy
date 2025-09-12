import { MongoClient, ObjectId } from 'mongodb';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookie from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token } = cookie.parse(req.headers.cookie || '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === 'string' || !('id' in decoded)) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const userId = (decoded as JwtPayload).id;

    await client.connect();
    const db = client.db('vision_therapy');
    const users = db.collection('users');

    const { characterDetails } = req.body;

    // Update user document with characterDetails

    const result = await users.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $set: { characterDetails } });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not updated', status: 'error' });
    }
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format', status: 'error' });
    }

    return res.status(200).json({ message: 'Personalization saved', status: 'success' });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ message: 'Failed to save character details', status: 'error' });
  } finally {
    await client.close();
  }
}
