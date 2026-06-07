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
      .filter(s => s.sessionType === 'patching' && (s.completed || s.completedAt))
      .map(s => {
        if (s.date) return s.date;
        return new Date(s.completedAt).toISOString().split('T')[0];
      })
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // Unique sorted dates
    const uniqueDates = Array.from(new Set(patchingDates));

    let streak = 0;
    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const lastSessionDate = uniqueDates[0];
      
      if (lastSessionDate === today || lastSessionDate === yesterdayStr) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const d1 = new Date(uniqueDates[i]);
          const d2 = new Date(uniqueDates[i+1]);
          const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
          if (Math.round(diff) === 1) streak++;
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

    const weeklyExerciseTypes = new Set(
      allSessions
        .filter(s => {
          const completedDate = new Date(s.completedAt);
          return (
            s.sessionType !== 'patching' && 
            !isNaN(completedDate.getTime()) && 
            completedDate >= sevenDaysAgo
          );
        })
        .map(s => s.sessionType)
    );

    const lastSession = allSessions.length > 0 
      ? allSessions.sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0]
      : null;

    return res.status(200).json({
      childName: user?.childName || user?.characterDetails?.me?.name || 'Little Hero',
      totalXP,
      exercisesCompleted,
      streak,
      weeklyStats: weeklySessions.length,
      weeklyChallenge: {
        count: weeklyExerciseTypes.size,
        total: 5,
        completed: weeklyExerciseTypes.size >= 5,
        types: Array.from(weeklyExerciseTypes)
      },
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
