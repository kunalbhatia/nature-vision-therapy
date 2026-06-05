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
    const users = db.collection('users');

    const user = await users.findOne({ _id: ObjectId.createFromHexString(userId) });
    const allSessions = await sessions.find({ userId: ObjectId.createFromHexString(userId) }).toArray();

    // Aggregate data
    const totalXP = allSessions.reduce((sum, s) => sum + (s.score || 0), 0);
    const exercisesCompleted = allSessions.length;
    
    // Calculate current streak
    const patchingDates = allSessions
      .filter(s => s.sessionType === 'patching' && s.completed)
      .map(s => s.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    if (patchingDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const lastSessionDate = patchingDates[0];
      const diffDays = Math.floor((new Date(today).getTime() - new Date(lastSessionDate).getTime()) / (1000 * 3600 * 24));
      
      if (diffDays <= 1) {
        streak = 1;
        for (let i = 0; i < patchingDates.length - 1; i++) {
          const d1 = new Date(patchingDates[i]);
          const d2 = new Date(patchingDates[i+1]);
          const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
          if (diff === 1) streak++;
          else break;
        }
      }
    }

    // Weekly stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklySessions = allSessions.filter(s => {
      if (!s.completedAt) return false;
      const completedDate = new Date(s.completedAt);
      return !isNaN(completedDate.getTime()) && completedDate >= sevenDaysAgo;
    });

    const lastSession = allSessions.length > 0 
      ? allSessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0]
      : null;

    return res.status(200).json({
      childName: user?.childName || user?.characterDetails?.me?.name || 'Little Hero',
      totalXP,
      exercisesCompleted,
      streak,
      weeklyStats: weeklySessions.length,
      level: Math.floor(totalXP / 500) + 1,
      nextLevelXP: 500 - (totalXP % 500),
      highestSnakeLevel: user?.highestSnakeLevel || 1,
      lastExerciseType: lastSession?.sessionType || null,
      therapyGoals: user?.therapyGoals || { dailyPatchingMinutes: 60, exercisesPerDay: 5 }
    });
  } catch (err) {
    console.error('Get summary error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  } finally {
    await client.close();
  }
}
