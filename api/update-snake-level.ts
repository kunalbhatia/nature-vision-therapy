import { MongoClient, ObjectId } from 'mongodb';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookie from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
const client = new MongoClient(uri);

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

    const { level } = req.body;

    const user = await users.findOne({ _id: ObjectId.createFromHexString(userId) });
    const currentHighest = user?.highestSnakeLevel || 1;

    if (level > currentHighest) {
      await users.updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        { $set: { highestSnakeLevel: level } }
      );
      return res.status(200).json({ message: 'Highest level updated', status: 'success' });
    }

    return res.status(200).json({ message: 'Level achieved', status: 'success' });
  } catch (err) {
    console.error('Update snake level error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  } finally {
    await client.close();
  }
}
