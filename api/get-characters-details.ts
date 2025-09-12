// /api/get-character-details.ts
import { MongoClient, ObjectId } from 'mongodb';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookie from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token } = cookie.parse(req.headers.cookie || '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);

  if (typeof decoded === 'string' || !('id' in decoded)) {
    return res.status(401).json({ error: 'Invalid token payload' });
  }

  const userId = (decoded as JwtPayload).id;

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('vision_therapy');

  const user = await db.collection('users').findOne({
    _id: ObjectId.createFromHexString(userId),
  });

  await client.close();

  return res.status(200).json({ characterDetails: user?.characterDetails || {} });
}
