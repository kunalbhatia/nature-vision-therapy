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
    const sessions = db.collection('therapy_sessions');

    const { gameId, score, durationSeconds, date } = req.body;

    const result = await sessions.insertOne({
      userId: ObjectId.createFromHexString(userId),
      sessionType: `game_${gameId}`,
      score,
      durationSeconds,
      date, // YYYY-MM-DD
      completedAt: new Date(),
    });

    if (result.acknowledged) {
      return res.status(200).json({ message: 'Score saved', status: 'success' });
    } else {
      return res.status(500).json({ message: 'Failed to save score', status: 'error' });
    }
  } catch (err) {
    console.error('Save score error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  } finally {
    await client.close();
  }
}
