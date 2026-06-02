import { MongoClient, ObjectId } from 'mongodb';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookie from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
const client = new MongoClient(uri);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

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

    const history = await sessions
      .find({ 
        userId: ObjectId.createFromHexString(userId),
        sessionType: 'patching'
      })
      .sort({ date: -1 })
      .limit(100)
      .toArray();

    // Map unified format back to component expectations if needed
    const formattedHistory = history.map(s => ({
      date: s.date,
      durationMinutes: Math.floor(s.durationSeconds / 60),
      completed: s.completed
    }));

    return res.status(200).json({ history: formattedHistory });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  } finally {
    await client.close();
  }
}
